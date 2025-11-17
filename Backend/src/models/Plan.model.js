const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      unique: true,
      trim: true
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Plan description is required']
    },
    price: {
      type: Number,
      required: [true, 'Plan price is required'],
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
      default: 'monthly'
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: 0
    },
    imageLimit: {
      type: Number,
      required: [true, 'Image limit is required'],
      min: 0
    },
    features: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    stripePriceId: {
      type: String,
      default: null
    },
    priority: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes
planSchema.index({ name: 1 });
planSchema.index({ isActive: 1 });
planSchema.index({ priority: 1 });

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;