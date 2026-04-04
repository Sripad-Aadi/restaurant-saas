import mongoose from 'mongoose';
import Order from '../../models/Order.js';
import OrderItem from '../../models/OrderItem.js';
import Product from '../../models/Product.js';
import { transitionOrder } from './order.statemachine.js';

export const createOrder = async (storeId, customerId, { tableId, idempotencyKey, items }) => {
  // Check for duplicate — return existing order if same idempotency key
  const existing = await Order.findOne({ storeId, idempotencyKey });
  if (existing) return { order: existing, isDuplicate: true };

  // Fetch all products from DB — never trust client prices
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ storeId, _id: { $in: productIds } });

  if (products.length !== productIds.length) {
    throw { status: 400, message: 'One or more products not found in this store' };
  }

  // Check all products are available
  const unavailable = products.filter((p) => !p.isAvailable);
  if (unavailable.length > 0) {
    throw {
      status: 400,
      message: `These items are currently unavailable: ${unavailable.map((p) => p.name).join(', ')}`,
    };
  }

  // Build a map for quick lookup
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  // Calculate total server-side
  let totalAmount = 0;
  const orderItems = items.map((item) => {
    const product = productMap.get(item.productId);
    const lineTotal = product.price * item.quantity;
    totalAmount += lineTotal;
    return {
      productId: product._id,
      name:      product.name,     // snapshot
      price:     product.price,    // snapshot in paise
      quantity:  item.quantity,
    };
  });

  // Use a MongoDB transaction for atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [order] = await Order.create([{
      storeId,
      tableId,
      customerId,
      totalAmount,
      idempotencyKey,
      status: 'PENDING',
    }], { session });

    const itemDocs = orderItems.map((item) => ({ ...item, orderId: order._id }));
    await OrderItem.insertMany(itemDocs, { session });

    await session.commitTransaction();
    session.endSession();

    return { order, isDuplicate: false };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export const getOrderById = async (storeId, orderId) => {
  const order = await Order.findOne({ storeId, _id: orderId });
  if (!order) throw { status: 404, message: 'Order not found' };

  const items = await OrderItem.find({ orderId: order._id });
  return { ...order.toObject(), items };
};

export const getOrdersByStore = async (storeId, filters = {}) => {
  const query = { storeId };
  if (filters.status) query.status = filters.status;

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .limit(filters.limit || 50);

  return orders;
};

export const getCustomerOrders = async (storeId, customerId) => {
  return Order.find({ storeId, customerId }).sort({ createdAt: -1 });
};

export const updateOrderStatus = async (storeId, orderId, newStatus) => {
  const order = await Order.findOne({ storeId, _id: orderId });
  if (!order) throw { status: 404, message: 'Order not found' };

  // Validate transition through state machine
  transitionOrder(order.status, newStatus);

  order.status = newStatus;
  await order.save();

  return order;
};