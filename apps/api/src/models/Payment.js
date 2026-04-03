import mongoose from 'mongoose';
import tenantPlugin from '../plugins/tenantPlugin.js';

const paymentSchema = new mongoose.Schema({
  storeId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  orderId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  razorpayOrderId:   { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String },
  amount:            { type: Number, required: true },
  status:            { type: String, enum: ['CREATED','CAPTURED','FAILED','REFUND_INITIATED','REFUNDED'], default: 'CREATED' },
}, { timestamps: true });

paymentSchema.plugin(tenantPlugin);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;