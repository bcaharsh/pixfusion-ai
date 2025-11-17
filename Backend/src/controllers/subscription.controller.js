const Subscription = require('../models/Subscription.model');
const Plan = require('../models/Plan.model');
const User = require('../models/User.model');
const subscriptionService = require('../services/subscription.service');
const paymentService = require('../services/payment.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const subscriptionController = {
  // Get all available plans
  getPlans: asyncHandler(async (req, res) => {
    const plans = await Plan.find({ isActive: true }).sort({ priority: 1 });

    res.json(
      new ApiResponse(200, { plans }, 'Plans retrieved successfully')
    );
  }),

  // Get plan by ID
  getPlanById: asyncHandler(async (req, res) => {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      throw new ApiError(404, 'Plan not found');
    }

    if (!plan.isActive) {
      throw new ApiError(400, 'This plan is no longer available');
    }

    res.json(
      new ApiResponse(200, { plan }, 'Plan retrieved successfully')
    );
  }),

  // Subscribe to a plan
  subscribe: asyncHandler(async (req, res) => {
    const { planId, paymentMethodId, billingCycle, autoRenew } = req.body;

    const user = await User.findById(req.user.id);
    const plan = await Plan.findById(planId);

    if (!plan) {
      throw new ApiError(404, 'Plan not found');
    }

    if (!plan.isActive) {
      throw new ApiError(400, 'This plan is no longer available');
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      userId: req.user.id,
      status: 'active'
    });

    if (existingSubscription) {
      throw new ApiError(400, 'You already have an active subscription. Please cancel it first or upgrade.');
    }

    // Create subscription
    const subscription = await subscriptionService.createSubscription({
      userId: req.user.id,
      planId,
      billingCycle: billingCycle || plan.billingCycle,
      autoRenew: autoRenew !== undefined ? autoRenew : true
    });

    // Process payment if not a free plan
    if (plan.price > 0) {
      const payment = await paymentService.createPayment({
        userId: req.user.id,
        subscriptionId: subscription._id,
        planId,
        amount: plan.price,
        paymentMethodId
      });

      if (payment.status !== 'succeeded') {
        subscription.status = 'pending_payment';
        await subscription.save();

        throw new ApiError(400, 'Payment failed. Please try again.');
      }
    }

    // Update user
    user.currentPlan = planId;
    user.imagesRemaining = plan.imageLimit;
    await user.save();

    subscription.status = 'active';
    await subscription.save();

    res.status(201).json(
      new ApiResponse(201, {
        subscription: await subscription.populate('planId')
      }, 'Subscription created successfully')
    );
  }),

  // Get current subscription
  getCurrentSubscription: asyncHandler(async (req, res) => {
    const subscription = await Subscription.findOne({
      userId: req.user.id,
      status: 'active'
    }).populate('planId');

    if (!subscription) {
      return res.json(
        new ApiResponse(200, {
          subscription: null,
          message: 'No active subscription'
        })
      );
    }

    // Calculate days remaining
    const daysRemaining = Math.ceil(
      (subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)
    );

    res.json(
      new ApiResponse(200, {
        subscription: {
          ...subscription.toObject(),
          daysRemaining,
          imagesRemaining: subscription.planId.imageLimit - subscription.imagesUsed
        }
      }, 'Subscription retrieved successfully')
    );
  }),

  // Get subscription history
  getSubscriptionHistory: asyncHandler(async (req, res) => {
    const subscriptions = await Subscription.find({
      userId: req.user.id
    })
      .populate('planId')
      .sort({ createdAt: -1 });

    res.json(
      new ApiResponse(200, { subscriptions }, 'Subscription history retrieved successfully')
    );
  }),

  // Cancel subscription
  cancelSubscription: asyncHandler(async (req, res) => {
    const { reason, feedback, cancelImmediately } = req.body;

    const subscription = await Subscription.findOne({
      userId: req.user.id,
      status: 'active'
    }).populate('planId');

    if (!subscription) {
      throw new ApiError(404, 'No active subscription found');
    }

    if (cancelImmediately) {
      // Cancel immediately
      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      subscription.cancellationReason = reason;
      subscription.cancellationFeedback = feedback;

      // Reset user to free plan
      const user = await User.findById(req.user.id);
      user.currentPlan = null;
      user.imagesRemaining = 3; // Free plan limit
      await user.save();
    } else {
      // Cancel at end of billing period
      subscription.autoRenew = false;
      subscription.cancellationReason = reason;
      subscription.cancellationFeedback = feedback;
    }

    await subscription.save();

    // Cancel Stripe subscription if exists
    if (subscription.stripeSubscriptionId) {
      try {
        await paymentService.cancelStripeSubscription(
          subscription.stripeSubscriptionId,
          !cancelImmediately
        );
      } catch (error) {
        console.error('Failed to cancel Stripe subscription:', error);
      }
    }

    res.json(
      new ApiResponse(200, {
        subscription,
        message: cancelImmediately
          ? 'Subscription cancelled immediately'
          : 'Subscription will be cancelled at the end of the billing period'
      })
    );
  }),

  // Reactivate subscription
  reactivateSubscription: asyncHandler(async (req, res) => {
    const subscription = await Subscription.findOne({
      userId: req.user.id,
      status: { $in: ['cancelled', 'expired'] },
      endDate: { $gt: new Date() }
    }).populate('planId');

    if (!subscription) {
      throw new ApiError(404, 'No subscription found to reactivate');
    }

    subscription.status = 'active';
    subscription.autoRenew = true;
    subscription.cancelledAt = null;
    await subscription.save();

    // Update user
    const user = await User.findById(req.user.id);
    user.currentPlan = subscription.planId._id;
    await user.save();

    res.json(
      new ApiResponse(200, { subscription }, 'Subscription reactivated successfully')
    );
  }),

  // Change/Upgrade plan
  changePlan: asyncHandler(async (req, res) => {
    const { newPlanId, upgradeImmediately } = req.body;

    const currentSubscription = await Subscription.findOne({
      userId: req.user.id,
      status: 'active'
    }).populate('planId');

    if (!currentSubscription) {
      throw new ApiError(404, 'No active subscription found');
    }

    const newPlan = await Plan.findById(newPlanId);
    if (!newPlan) {
      throw new ApiError(404, 'New plan not found');
    }

    if (!newPlan.isActive) {
      throw new ApiError(400, 'The selected plan is no longer available');
    }

    // Check if it's an upgrade or downgrade
    const isUpgrade = newPlan.price > currentSubscription.planId.price;

    if (upgradeImmediately && isUpgrade) {
      // Calculate prorated amount
      const proratedAmount = await subscriptionService.calculateProration(
        currentSubscription,
        newPlan
      );

      // Process prorated payment
      if (proratedAmount > 0) {
        const payment = await paymentService.createPayment({
          userId: req.user.id,
          subscriptionId: currentSubscription._id,
          planId: newPlanId,
          amount: proratedAmount,
          paymentMethodId: req.body.paymentMethodId
        });

        if (payment.status !== 'succeeded') {
          throw new ApiError(400, 'Payment failed for plan upgrade');
        }
      }

      // Update subscription immediately
      currentSubscription.planId = newPlanId;
      currentSubscription.imagesUsed = 0;
      
      // Update user
      const user = await User.findById(req.user.id);
      user.currentPlan = newPlanId;
      user.imagesRemaining = newPlan.imageLimit;
      await user.save();

      await currentSubscription.save();

      res.json(
        new ApiResponse(200, {
          subscription: await currentSubscription.populate('planId')
        }, 'Plan upgraded successfully')
      );
    } else {
      // Schedule plan change for next billing cycle
      currentSubscription.scheduledPlanChange = newPlanId;
      await currentSubscription.save();

      res.json(
        new ApiResponse(200, {
          subscription: currentSubscription,
          message: 'Plan will be changed at the next billing cycle'
        })
      );
    }
  }),

  // Update payment method
  updatePaymentMethod: asyncHandler(async (req, res) => {
    const { paymentMethodId } = req.body;

    const subscription = await Subscription.findOne({
      userId: req.user.id,
      status: 'active'
    });

    if (!subscription) {
      throw new ApiError(404, 'No active subscription found');
    }

    // Update payment method in Stripe
    if (subscription.stripeSubscriptionId) {
      await paymentService.updatePaymentMethod(
        subscription.stripeSubscriptionId,
        paymentMethodId
      );
    }

    res.json(
      new ApiResponse(200, null, 'Payment method updated successfully')
    );
  })
};

module.exports = subscriptionController;