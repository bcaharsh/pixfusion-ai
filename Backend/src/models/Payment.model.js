const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'credit_card'],
    default: 'stripe'
  },
  stripePaymentIntentId: {
    type: String,
    default: null,
    index: true
  },
  stripeInvoiceId: {
    type: String,
    default: null
  },
  stripeChargeId: {
    type: String,
    default: null
  },
  receipt: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  metadata: {
    type: Map,
    of: String
  },
  refundedAt: {
    type: Date,
    default: null
  },
  refundReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);