import mongoose from 'mongoose';

export const PAYMENT_STATUS = {
  PENDING: 'pending',       // Razorpay order created, awaiting capture
  CAPTURED: 'captured',     // webhook confirmed payment success
  FAILED: 'failed',         // payment failed
  REFUNDED: 'refunded',     // full refund issued
  PARTIAL_REFUND: 'partial_refund',
};

export const PAYMENT_METHOD = {
  UPI: 'upi',
  CARD: 'card',
  NETBANKING: 'netbanking',
  WALLET: 'wallet',
};

const paymentSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    // Razorpay identifiers
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true, // one Razorpay order per platform order
    },
    razorpayPaymentId: {
      type: String,
      default: null, // populated after capture
    },
    razorpaySignature: {
      type: String,
      select: false, // store for audit, never expose in API response
      default: null,
    },
    razorpayRefundId: {
      type: String,
      default: null,
    },

    amount: {
      type: Number,
      required: true, // in paise (₹1 = 100 paise)
    },
    currency: {
      type: String,
      default: 'INR',
    },

    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },

    method: {
      type: String,
      enum: [...Object.values(PAYMENT_METHOD), null],
      default: null, // populated from Razorpay webhook payload
    },

    // Raw Razorpay webhook payload — stored for audit/debugging
    webhookPayload: {
      type: mongoose.Schema.Types.Mixed,
      select: false,
      default: null,
    },

    capturedAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
    refundAmount: { type: Number, default: null }, // in paise
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
paymentSchema.index({ orderId: 1 });                         // payment lookup for an order
paymentSchema.index({ storeId: 1, status: 1, createdAt: -1 }); // store-level payment reporting
paymentSchema.index({ storeId: 1, createdAt: -1 });          // analytics aggregation

export default mongoose.model('Payment', paymentSchema);