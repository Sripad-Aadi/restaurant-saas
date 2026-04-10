import mongoose from 'mongoose';
import Order from '../../models/Order.js';
import OrderItem from '../../models/OrderItem.js';
import Product from '../../models/Product.js';
import { transitionOrder } from './order.statemachine.js';
import { emitToRoom } from '../../config/socketEmitter.js';
import { SOCKET_EVENTS } from '@restaurant-saas/shared';

export const createOrder = async (storeId, customerId, { tableId, idempotencyKey, items }) => {
  const existing = await Order.findOne({ storeId, idempotencyKey });
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

  let totalAmount = 0;
  const orderItems = items.map((item) => {
    const product = productMap.get(item.productId);
    totalAmount += product.price * item.quantity;
    return {
      productId: product._id,
      name:      product.name,
      price:     product.price,
      quantity:  item.quantity,
    };
  });

  const order = await Order.create({
    storeId,
    tableId,
    customerId,
    totalAmount,
    idempotencyKey,
    status: 'PENDING',
  });

  const itemDocs = orderItems.map((item) => ({ ...item, orderId: order._id }));
  await OrderItem.insertMany(itemDocs);

  // Notify admin dashboard of new order
  await emitToRoom('/orders', `store:${storeId}`, SOCKET_EVENTS.ORDER_NEW, {
    orderId:     order._id,
    tableId:     order.tableId,
    totalAmount: order.totalAmount,
    status:      order.status,
    createdAt:   order.createdAt,
  });

  return { order, isDuplicate: false };
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

  return Order.find(query)
    .sort({ createdAt: -1 })
    .limit(filters.limit || 50);
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
  await emitToRoom('/orders', `order:${orderId}`, SOCKET_EVENTS.ORDER_STATUS_UPDATED, {
    orderId,
    status:    newStatus,
    updatedAt: new Date(),
  });

  // Notify admin dashboard
  await emitToRoom('/orders', `store:${storeId}`, SOCKET_EVENTS.ORDER_STATUS_UPDATED, {
    orderId,
    status:    newStatus,
    updatedAt: new Date(),
  });

  // If completed, update analytics
  if (newStatus === 'COMPLETED') {
    await emitToRoom('/analytics', `analytics:${storeId}`, SOCKET_EVENTS.ANALYTICS_UPDATE, {
      type:        'ORDER_COMPLETED',
      orderId,
      totalAmount: order.totalAmount,
      updatedAt:   new Date(),
    });
  }

  return order;
};