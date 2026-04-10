import crypto from 'crypto';
import mongoose from 'mongoose';
import Payment from '../../models/Payment.js';
import Order from '../../models/Order.js';
import { transitionOrder } from '../orders/order.statemachine.js';
import { emitToRoom } from '../../config/socketEmitter.js';
import { SOCKET_EVENTS } from '@restaurant-saas/shared';

const isDev = process.env.NODE_ENV !== 'production';

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key') {
  const Razorpay = (await import('razorpay')).default;
  razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export const initiatePayment = async (storeId, orderId) => {
  const order = await Order.findOne({ storeId, _id: orderId });
  if (!order) throw { status: 404, message: 'Order not found' };

  if (order.status !== 'PENDING') {
    throw { status: 400, message: 'Payment can only be initiated for pending orders' };
  }

  const existingPayment = await Payment.findOne({ storeId, orderId });
  if (existingPayment) {
    return { payment: existingPayment, razorpayOrderId: existingPayment.razorpayOrderId };
  }

  if (isDev && !razorpay) {
    const mockRazorpayOrderId = `mock_order_${crypto.randomUUID()}`;

    const payment = await Payment.create({
      storeId,
      orderId:         order._id,
      razorpayOrderId: mockRazorpayOrderId,
      amount:          order.totalAmount,
      status:          'CREATED',
    });

    await Order.findOneAndUpdate({ storeId, _id: orderId }, { paymentId: payment._id });

    return {
      payment,
      razorpayOrderId: mockRazorpayOrderId,
      amount:          order.totalAmount,
      currency:        'INR',
      keyId:           'MOCK_KEY',
      mock:            true,
    };
  }

  const razorpayOrder = await razorpay.orders.create({
    amount:   order.totalAmount,
    currency: 'INR',
    receipt:  order._id.toString(),
  });

  const payment = await Payment.create({
    storeId,
    orderId:         order._id,
    razorpayOrderId: razorpayOrder.id,
    amount:          order.totalAmount,
    status:          'CREATED',
  });

  await Order.findOneAndUpdate({ storeId, _id: orderId }, { paymentId: payment._id });

  return {
    payment,
    razorpayOrderId: razorpayOrder.id,
    amount:          order.totalAmount,
    currency:        'INR',
    keyId:           process.env.RAZORPAY_KEY_ID,
  };
};

export const handleWebhook = async (rawBody, signature) => {
  if (isDev) {
    const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    if (event.event === 'payment.captured') {
      await handlePaymentCaptured(event.payload.payment.entity);
    } else if (event.event === 'payment.failed') {
      await handlePaymentFailed(event.payload.payment.entity);
    }
    return { received: true, mock: true };
  }

  if (!signature) throw { status: 400, message: 'Missing signature header' };

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    throw { status: 400, message: 'Invalid webhook signature' };
  }

  const event = JSON.parse(rawBody);
  if (event.event === 'payment.captured') {
    await handlePaymentCaptured(event.payload.payment.entity);
  } else if (event.event === 'payment.failed') {
    await handlePaymentFailed(event.payload.payment.entity);
  }

  return { received: true };
};

const handlePaymentCaptured = async (paymentEntity) => {
  const { order_id: razorpayOrderId, id: razorpayPaymentId } = paymentEntity;

  const paymentDoc = await mongoose.connection
    .collection('payments')
    .findOne({ razorpayOrderId });

  if (!paymentDoc) throw new Error(`Payment not found for Razorpay order: ${razorpayOrderId}`);
  if (paymentDoc.status === 'CAPTURED') return;

  await mongoose.connection.collection('payments').updateOne(
    { razorpayOrderId },
    { $set: { razorpayPaymentId, status: 'CAPTURED' } }
  );

  const orderDoc = await mongoose.connection
    .collection('orders')
    .findOne({ _id: paymentDoc.orderId });

  if (orderDoc && orderDoc.status === 'PENDING') {
    transitionOrder(orderDoc.status, 'CONFIRMED');
    await mongoose.connection.collection('orders').updateOne(
      { _id: paymentDoc.orderId },
      { $set: { status: 'CONFIRMED' } }
    );

    // Emit to admin and customer
    await emitToRoom('/orders', `store:${orderDoc.storeId}`, SOCKET_EVENTS.ORDER_CONFIRMED, {
      orderId:  orderDoc._id,
      status:   'CONFIRMED',
    });
    await emitToRoom('/orders', `order:${orderDoc._id}`, SOCKET_EVENTS.ORDER_CONFIRMED, {
      orderId:  orderDoc._id,
      status:   'CONFIRMED',
    });
  }
};

const handlePaymentFailed = async (paymentEntity) => {
  const { order_id: razorpayOrderId, id: razorpayPaymentId } = paymentEntity;

  const paymentDoc = await mongoose.connection
    .collection('payments')
    .findOne({ razorpayOrderId });

  if (!paymentDoc) return;
  if (paymentDoc.status === 'FAILED') return;

  await mongoose.connection.collection('payments').updateOne(
    { razorpayOrderId },
    { $set: { razorpayPaymentId, status: 'FAILED' } }
  );

  const orderDoc = await mongoose.connection
    .collection('orders')
    .findOne({ _id: paymentDoc.orderId });

  if (orderDoc && orderDoc.status === 'PENDING') {
    await mongoose.connection.collection('orders').updateOne(
      { _id: paymentDoc.orderId },
      { $set: { status: 'CANCELLED' } }
    );
  }
};

export const refundPayment = async (storeId, orderId) => {
  const payment = await Payment.findOne({ storeId, orderId, status: 'CAPTURED' });
  if (!payment) throw { status: 400, message: 'No captured payment found for this order' };

  if (isDev && !razorpay) {
    payment.status = 'REFUND_INITIATED';
    await payment.save();
    return { ...payment.toObject(), mock: true };
  }

  await razorpay.payments.refund(payment.razorpayPaymentId, { amount: payment.amount });
  payment.status = 'REFUND_INITIATED';
  await payment.save();

  return payment;
};