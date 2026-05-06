import mongoose from 'mongoose';
import { Order } from '../../models/Order.js';
import Product from '../../models/Product.js';
import Table from '../../models/Table.js';
import { transitionOrder } from './order.statemachine.js';
import { emitToRoom } from '../../config/socketEmitter.js';
import { SOCKET_EVENTS } from '@restaurant-saas/shared';

export const createOrder = async (storeId, customerId, { tableId, idempotencyKey, items, specialInstructions = '' }) => {
  const existing = await Order.findOne({ storeId, idempotencyKey }).select('+idempotencyKey');
  if (existing) return { order: existing, isDuplicate: true };

  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ storeId, _id: { $in: productIds } });

  if (products.length !== productIds.length) {
    throw { status: 400, message: 'One or more products not found in this store' };
  }

  const unavailable = products.filter((p) => !p.isAvailable);
  if (unavailable.length > 0) {
    throw {
      status: 400,
      message: `These items are currently unavailable: ${unavailable.map((p) => p.name).join(', ')}`,
    };
  }

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let subtotal = 0;
  const orderItems = items.map((item) => {
    const product = productMap.get(item.productId);
    const itemSubtotal = product.price * item.quantity;
    subtotal += itemSubtotal;
    return {
      productId: product._id,
      name:      product.name,
      price:     product.price,
      quantity:  item.quantity,
      subtotal:  itemSubtotal,
      foodType:  product.foodType,
      image:     product.image,
    };
  });

  const orderNumber = await Order.generateOrderNumber(storeId);

  const order = await Order.create({
    storeId,
    orderNumber,
    tableId: tableId || null,
    customerId: customerId || null,
    items: orderItems,
    specialInstructions,
    subtotal,
    total: subtotal,
    idempotencyKey,
    status: 'PENDING',
  });

  // Notify admin dashboard of new order
  await emitToRoom('/admin', `store:${storeId}`, SOCKET_EVENTS.ORDER_NEW, {
    orderId:     order._id,
    orderNumber: order.orderNumber,
    tableId:     order.tableId,
    totalAmount: order.total,
    status:      order.status,
    createdAt:   order.createdAt,
  });

  // Update table status if applicable
  if (tableId) {
    await Table.findByIdAndUpdate(tableId, { isOccupied: true });
    await emitToRoom('/admin', `store:${storeId}`, SOCKET_EVENTS.TABLE_OCCUPIED, {
      tableId,
      isOccupied: true
    });
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