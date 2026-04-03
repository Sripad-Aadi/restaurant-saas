import mongoose from 'mongoose';
import tenantPlugin from '../plugins/tenantPlugin.js';

const orderSchema = new mongoose.Schema({
  storeId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  tableId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  customerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalAmount:    { type: Number, required: true },
  status:         { type: String, enum: ['PENDING','CONFIRMED','PREPARING','READY','COMPLETED','CANCELLED'], default: 'PENDING' },
  idempotencyKey: { type: String, required: true },
  paymentId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
}, { timestamps: true });

orderSchema.index({ storeId: 1, status: 1 });
orderSchema.index({ storeId: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, idempotencyKey: 1 }, { unique: true });
orderSchema.plugin(tenantPlugin);

const Order = mongoose.model('Order', orderSchema);
export default Order;