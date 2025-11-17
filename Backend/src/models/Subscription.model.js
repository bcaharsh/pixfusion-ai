const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'trial', 'past_due'],
    default: 'active'
  },
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  stripeCustomerId: {
    type: String,
    default: null
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  creditsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  creditsRemaining: {
    type: Number,
    default: 0,
    min: 0
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });

// Check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && this.currentPeriodEnd > new Date();
};

// Check if subscription has expired
subscriptionSchema.methods.isExpired = function() {
  return this.currentPeriodEnd < new Date();
};

// Get remaining credits
subscriptionSchema.methods.getRemainingCredits = function() {
  return Math.max(0, this.creditsRemaining - this.creditsUsed);
};

// Use credits
subscriptionSchema.methods.useCredits = async function(amount = 1) {
  if (this.creditsUsed + amount > this.creditsRemaining) {
    throw new Error('Insufficient credits in subscription');
  }
  this.creditsUsed += amount;
  return await this.save();
};

// Reset credits (for new billing period)
subscriptionSchema.methods.resetCredits = async function(newCreditAmount) {
  this.creditsUsed = 0;
  this.creditsRemaining = newCreditAmount;
  return await this.save();
};

module.exports = mongoose.model('Subscription', subscriptionSchema);