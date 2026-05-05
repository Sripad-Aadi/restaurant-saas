import mongoose from 'mongoose';
import { Order } from '../../models/Order.js';
import Product from '../../models/Product.js';
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
  await emitToRoom('/orders', `store:${storeId}`, SOCKET_EVENTS.ORDER_NEW, {
    orderId:     order._id,
    orderNumber: order.orderNumber,
    tableId:     order.tableId,
    totalAmount: order.total,
    status:      order.status,
    createdAt:   order.createdAt,
  });

  return { order, isDuplicate: false };
};

export const getOrderById = async (storeId, orderId) => {
  const order = await Order.findOne({ storeId, _id: orderId });
  if (!order) throw { status: 404, message: 'Order not found' };

  return order.toObject();
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