const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const orderSchema = new mongoose.Schema({
  storeId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  tableId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  customerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalAmount:    { type: Number, required: true }, // paise
  status:         { type: String, enum: ['PENDING','CONFIRMED','PREPARING','READY','COMPLETED','CANCELLED'], default: 'PENDING' },
  idempotencyKey: { type: String, required: true },
  paymentId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
}, { timestamps: true });

orderSchema.index({ storeId: 1, status: 1 });
orderSchema.index({ storeId: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, idempotencyKey: 1 }, { unique: true });
orderSchema.plugin(tenantPlugin);
module.exports = mongoose.model('Order', orderSchema);