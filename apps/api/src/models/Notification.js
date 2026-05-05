import mongoose from 'mongoose';

export const NOTIFICATION_TYPE = {
  NEW_ORDER: 'new_order',
  ORDER_STATUS_CHANGED: 'order_status_changed',
  ORDER_CANCELLED: 'order_cancelled',
  LOW_STOCK: 'low_stock',           // future use
  STORE_DEACTIVATED: 'store_deactivated',
};

const notificationSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    // Recipient admin user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      maxlength: 300,
    },
    // Optional reference to the related entity
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    refModel: {
      type: String,
      enum: ['Order', 'Store', 'Product', null],
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
// Unread count badge — most frequent query
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
// Notification panel list
notificationSchema.index({ storeId: 1, userId: 1, createdAt: -1 });

// TTL: auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export default mongoose.model('Notification', notificationSchema);