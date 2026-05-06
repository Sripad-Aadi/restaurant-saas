import mongoose from 'mongoose';
import { Order } from '../../models/Order.js';
import Product from '../../models/Product.js';
import Table from '../../models/Table.js';
import { transitionOrder } from './order.statemachine.js';
import { emitToRoom } from '../../config/socketEmitter.js';
import { SOCKET_EVENTS } from '@restaurant-saas/shared';

export const createOrder = async (storeId, customerId, { tableId, idempotencyKey, items, specialInstructions = '' }) => {
  console.log('[order.service] createOrder called', { storeId, tableId, itemCount: items?.length });

  // 1. Check for duplicate order via idempotency
  const existing = await Order.findOne({ storeId, idempotencyKey }).select('+idempotencyKey');
  if (existing) {
    console.log('[order.service] Duplicate order found via idempotencyKey');
    return { order: existing, isDuplicate: true };
  }

  // 2. Validate and fetch products
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw { status: 400, message: 'Order must contain at least one item' };
  }

  const productIds = items.map((i) => i.productId);
  console.log('[order.service] Fetching products', productIds);
  const products = await Product.find({ storeId, _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));
  console.log(`[order.service] Found ${products.length} products in DB`);

  // 3. Fetch table info if provided (can be ObjectId or Table Number from QR URL)
  let table = null;
  if (tableId) {
    console.log('[order.service] Fetching table info for identifier:', tableId);
    if (mongoose.Types.ObjectId.isValid(tableId)) {
      table = await Table.findOne({ storeId, _id: tableId });
    } else {
      // If it's not a valid ObjectId, assume it's a tableNumber (from QR URL)
      const tableNum = parseInt(tableId, 10);
      if (!isNaN(tableNum)) {
        table = await Table.findOne({ storeId, tableNumber: tableNum });
      }
    }
    console.log('[order.service] Table result:', table ? `Found #${table.tableNumber}` : 'Not found');
  }

  // 4. Calculate totals and build item snapshots
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = productMap.get(item.productId.toString());
    if (!product) {
      console.error(`[order.service] Product not found in map: ${item.productId}`);
      throw { status: 400, message: `Product not found: ${item.productId}` };
    }
    if (!product.isAvailable) {
      throw { status: 400, message: `Product unavailable: ${product.name}` };
    }

    const price = Number(product.price);
    const quantity = Number(item.quantity);
    const itemSubtotal = price * quantity;
    subtotal += itemSubtotal;

    orderItems.push({
      productId: product._id,
      name:      product.name,
      price:     price,
      quantity:  quantity,
      subtotal:  itemSubtotal,
      foodType:  product.foodType,
      image:     product.image,
    });
  }

  // 5. Generate order number and save
  console.log('[order.service] Generating order number');
  const orderNumber = await Order.generateOrderNumber(storeId);
  console.log('[order.service] New order number:', orderNumber);

  console.log('[order.service] Attempting Order.create');
  const order = await Order.create({
    storeId,
    orderNumber,
    tableId:     table?._id || null,
    tableNumber: table?.tableNumber || null,
    customerId:  (customerId && mongoose.Types.ObjectId.isValid(customerId)) ? customerId : null,
    items:       orderItems,
    specialInstructions,
    subtotal,
    total:       subtotal,
    idempotencyKey,
    status:      'PENDING',
  });
  console.log('[order.service] Order created in DB');

  // 6. Async side effects (non-blocking for response)
  // Notify admin dashboard
  console.log('[order.service] Emitting side effects');
  emitToRoom('/admin', `store:${storeId}`, SOCKET_EVENTS.ORDER_NEW, order.toObject())
    .catch(err => console.error('Failed to emit order:new:', err.message));

  // Update table status
  if (table) {
    Table.findByIdAndUpdate(table._id, { isOccupied: true }).catch(() => {});
    emitToRoom('/admin', `store:${storeId}`, SOCKET_EVENTS.TABLE_OCCUPIED, {
      tableId:    table._id,
      isOccupied: true
    }).catch(() => {});
  }

  return { order, isDuplicate: false };
};

export const getOrderById = async (storeId, orderId) => {
  const order = await Order.findOne({ storeId, _id: orderId });
  if (!order) throw { status: 404, message: 'Order not found' };

  return order.toObject();
};

export const getOrdersByStore = async (storeId, { status, page = 1, limit = 50 } = {}) => {
  const query = { storeId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query)
  ]);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getCustomerOrders = async (storeId, customerId) => {
  return Order.find({ storeId, customerId }).sort({ createdAt: -1 });
};

export const updateOrderStatus = async (storeId, orderId, newStatus) => {
  const order = await Order.findOne({ storeId, _id: orderId });
  if (!order) throw { status: 404, message: 'Order not found' };

  transitionOrder(order.status, newStatus);

  order.status = newStatus;
  await order.save();

  // Notify customer tracking page
  let customerEvent = SOCKET_EVENTS.ORDER_STATUS_CHANGED;
  if (newStatus === 'READY') customerEvent = SOCKET_EVENTS.ORDER_READY;
  if (newStatus === 'CANCELLED') customerEvent = SOCKET_EVENTS.ORDER_CANCELLED;

  await emitToRoom('/customer', `order:${orderId}`, customerEvent, {
    orderId,
    status:    newStatus,
    updatedAt: new Date(),
  });

  // Notify admin dashboard
  await emitToRoom('/admin', `store:${storeId}`, SOCKET_EVENTS.ORDER_STATUS_CHANGED, {
    orderId,
    status:    newStatus,
    updatedAt: new Date(),
  });

  // If completed, update analytics
  if (newStatus === 'COMPLETED') {
    await emitToRoom('/admin', `store:${storeId}`, SOCKET_EVENTS.ANALYTICS_UPDATE, {
      type:        'ORDER_COMPLETED',
      orderId,
      totalAmount: order.total,
      updatedAt:   new Date(),
    });
  }

  // Handle table occupancy release
  if (order.tableId && (newStatus === 'COMPLETED' || newStatus === 'CANCELLED')) {
    // Check if there are other active orders for this table
    const activeOrdersCount = await Order.countDocuments({
      storeId,
      tableId: order.tableId,
      _id: { $ne: order._id },
      status: { $in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'] }
    });

    if (activeOrdersCount === 0) {
      await Table.findByIdAndUpdate(order.tableId, { isOccupied: false });
      await emitToRoom('/admin', `store:${storeId}`, SOCKET_EVENTS.TABLE_FREED, {
        tableId: order.tableId,
        isOccupied: false
      });
    }
  }

  return order;
};

export const processOrderPayment = async (storeId, orderId, paymentData = {}) => {
  const order = await Order.findOne({ storeId, _id: orderId });
  if (!order) throw { status: 404, message: 'Order not found' };

  if (order.paymentStatus !== 'PAID') {
    order.paymentStatus = 'PAID';
    if (paymentData.paymentId) order.paymentId = paymentData.paymentId;
    await order.save();

    // Notify admin
    await emitToRoom('/admin', `store:${storeId}`, SOCKET_EVENTS.ORDER_STATUS_CHANGED, {
      orderId,
      status: order.status,
      paymentStatus: 'PAID',
      updatedAt: new Date(),
    });

    // Notify customer
    await emitToRoom('/customer', `order:${orderId}`, 'order:payment_success', {
      orderId,
      paymentStatus: 'PAID'
    });
  }

  return order;
};