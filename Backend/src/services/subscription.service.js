const Subscription = require('../models/Subscription.model');
const Plan = require('../models/Plan.model');
const User = require('../models/User.model');
const stripe = require('../config/stripe');
const emailService = require('./email.service');
const ApiError = require('../utils/ApiError');

const subscriptionService = {
  // Create new subscription
  createSubscription: async ({ userId, planId, billingCycle, autoRenew }) => {
    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new ApiError(404, 'Plan not found');
    }

    const startDate = new Date();
    const endDate = new Date();
    
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const subscription = await Subscription.create({
      userId,
      planId,
      startDate,
      endDate,
      status: 'pending',
      billingCycle,
      autoRenew: autoRenew !== undefined ? autoRenew : true,
      imagesUsed: 0
    });

    return subscription;
  },

  // Update subscription
  updateSubscription: async (subscriptionId, updateData) => {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new ApiError(404, 'Subscription not found');
    }

    Object.assign(subscription, updateData);
    await subscription.save();

    return subscription;
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId, immediate = false) => {
    const subscription = await Subscription.findById(subscriptionId)
      .populate('userId')
      .populate('planId');

    if (!subscription) {
      throw new ApiError(404, 'Subscription not found');
    }

    if (immediate) {
      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      
      // Reset user to free plan
      const user = await User.findById(subscription.userId._id);
      user.currentPlan = null;
      user.imagesRemaining = 3; // Free plan limit
      await user.save();
    } else {
      subscription.autoRenew = false;
    }

    await subscription.save();

    // Send cancellation email
    try {
      await emailService.sendSubscriptionCancelled(
        subscription.userId.email,
        subscription.userId.name,
        subscription.planId.name
      );
    } catch (error) {
      console.error('Failed to send cancellation email:', error);
    }

    return subscription;
  },

  // Renew subscription
  renewSubscription: async (subscriptionId) => {
    const subscription = await Subscription.findById(subscriptionId)
      .populate('planId')
      .populate('userId');

    if (!subscription) {
      throw new ApiError(404, 'Subscription not found');
    }

    const plan = subscription.planId;

    // Reset usage
    subscription.imagesUsed = 0;
    subscription.startDate = new Date();
    
    const endDate = new Date();
    if (subscription.billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    subscription.endDate = endDate;
    subscription.status = 'active';

    await subscription.save();

    // Update user
    const user = await User.findById(subscription.userId._id);
    user.imagesRemaining = plan.imageLimit;
    user.credits = plan.credits; // ✅ UPDATED to use credits
    await user.save();

    return subscription;
  },

  // Calculate proration for plan change
  calculateProration: async (currentSubscription, newPlan) => {
    const currentPlan = await Plan.findById(currentSubscription.planId);
    
    const now = new Date();
    const daysRemaining = Math.ceil(
      (currentSubscription.endDate - now) / (1000 * 60 * 60 * 24)
    );
    
    const totalDays = currentSubscription.billingCycle === 'yearly' ? 365 : 30;
    
    const unusedAmount = (currentPlan.price / totalDays) * daysRemaining;
    const newAmount = (newPlan.price / totalDays) * daysRemaining;
    
    const proratedAmount = Math.max(0, newAmount - unusedAmount);
    
    return parseFloat(proratedAmount.toFixed(2));
  },

  // Get active subscriptions expiring soon
  getExpiringSubscriptions: async (daysThreshold = 7) => {
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const subscriptions = await Subscription.find({
      status: 'active',
      autoRenew: false,
      endDate: {
        $gte: now,
        $lte: thresholdDate
      }
    })
      .populate('userId', 'name email')
      .populate('planId', 'name displayName price'); // ✅ UPDATED to include displayName

    return subscriptions;
  },

  // Get expired subscriptions
  getExpiredSubscriptions: async () => {
    const now = new Date();

    const subscriptions = await Subscription.find({
      status: 'active',
      endDate: { $lt: now }
    })
      .populate('userId', 'name email')
      .populate('planId', 'name displayName'); // ✅ UPDATED

    return subscriptions;
  },

  // Handle expired subscriptions
  handleExpiredSubscriptions: async () => {
    const expiredSubscriptions = await subscriptionService.getExpiredSubscriptions();

    for (const subscription of expiredSubscriptions) {
      subscription.status = 'expired';
      await subscription.save();

      // Reset user to free plan
      const user = await User.findById(subscription.userId._id);
      user.currentPlan = null;
      user.imagesRemaining = 3; // Free plan limit
      user.credits = 3; // ✅ ADDED
      await user.save();

      // Send expiration email
      try {
        await emailService.sendSubscriptionExpired(
          subscription.userId.email,
          subscription.userId.name,
          subscription.planId.displayName // ✅ UPDATED to use displayName
        );
      } catch (error) {
        console.error('Failed to send expiration email:', error);
      }
    }

    return expiredSubscriptions.length;
  }
};

module.exports = subscriptionService;