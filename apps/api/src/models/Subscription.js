import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'canceled', 'trial'],
    default: 'active',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  lastPaymentId: {
    type: String,
  },
}, {
  timestamps: true,
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
