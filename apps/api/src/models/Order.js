import mongoose from 'mongoose';

// ─── Shared constants (also in packages/shared/constants) ───────────────────
export const ORDER_STATUS = {
  PENDING: 'PENDING',       // created, awaiting payment
  CONFIRMED: 'CONFIRMED',   // payment received
  PREPARING: 'PREPARING',   // kitchen accepted
  READY: 'READY',           // food ready for pickup/delivery
  COMPLETED: 'COMPLETED',   // handed to customer
  CANCELLED: 'CANCELLED',   // cancelled by admin or system timeout
};

// Valid transitions — enforced in the controller, not the model
export const STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.READY]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

// ─── OrderItem (embedded subdocument) ────────────────────────────────────────
// Stored inline inside Order — no separate collection needed.
// Snapshot of product data at time of order (price may change later).
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },   // snapshot
    price: { type: Number, required: true },  // snapshot — unit price at order time
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    subtotal: { type: Number, required: true }, // price × quantity
    foodType: { type: String, default: null },  // snapshot for kitchen display
    image: { type: String, default: null },     // snapshot
  },
  { _id: true }
);

// ─── Order ───────────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // Tenant isolation
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },

    // Human-readable ID displayed in UI and receipts, e.g. "ORD-0421"
    orderNumber: {
      type: String,
      required: true,
    },

    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      default: null,
    },
    tableNumber: {
      type: Number,
      default: null, // snapshot — table may be deleted later
    },

    // Optional — only populated if customer is logged in
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(arr) => arr.length > 0, 'Order must have at least one item'],
    },

    specialInstructions: {
      type: String,
      maxlength: [200, 'Special instructions cannot exceed 200 characters'],
      default: '',
    },

    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },

    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },

    // Status history for the timeline stepper in both admin and customer UI
    statusHistory: [
      {
        status: { type: String, enum: Object.values(ORDER_STATUS) },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      },
    ],

    // Idempotency key sent from client — prevents duplicate orders on retry
    idempotencyKey: {
      type: String,
      required: true,
      select: false,
    },

    // Set after Razorpay payment is verified
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────

// Live order queue — most critical query, hits on every admin page load
orderSchema.index({ storeId: 1, status: 1, createdAt: -1 });

// Order tracking page — customer polls by orderId (covered by _id) but also by storeId
orderSchema.index({ storeId: 1, _id: 1 });

// Analytics aggregations — revenue/count grouped by date
orderSchema.index({ storeId: 1, createdAt: -1 });

// SuperAdmin platform-wide queries
orderSchema.index({ createdAt: -1 });

// Idempotency enforcement
orderSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

// Customer order history
orderSchema.index({ customerId: 1, storeId: 1, createdAt: -1 });

// Table occupancy check
orderSchema.index({ storeId: 1, tableId: 1, status: 1 });

// ─── Hooks ───────────────────────────────────────────────────────────────────
// Auto-push to statusHistory on every status change
orderSchema.pre('save', function () {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status });
  }
});

// ─── Statics ─────────────────────────────────────────────────────────────────
// Generate human-readable order number: ORD-XXXX (store-scoped sequential)
orderSchema.statics.generateOrderNumber = async function (storeId) {
  const count = await this.countDocuments({ storeId });
  return `ORD-${String(count + 1).padStart(4, '0')}`;
};

export const Order = mongoose.model('Order', orderSchema);
export default Order;