const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const notificationSchema = new mongoose.Schema({
  storeId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  message:  { type: String, required: true },
  isRead:   { type: Boolean, default: false },
  type:     { type: String, enum: ['ORDER', 'SYSTEM'], default: 'ORDER' },
  refId:    { type: mongoose.Schema.Types.ObjectId }, // orderId or other ref
}, { timestamps: true });

notificationSchema.plugin(tenantPlugin);
module.exports = mongoose.model('Notification', notificationSchema);