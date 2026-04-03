import mongoose from 'mongoose';
import tenantPlugin from '../plugins/tenantPlugin.js';

const notificationSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  message: { type: String, required: true },
  isRead:  { type: Boolean, default: false },
  type:    { type: String, enum: ['ORDER', 'SYSTEM'], default: 'ORDER' },
  refId:   { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

notificationSchema.plugin(tenantPlugin);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;