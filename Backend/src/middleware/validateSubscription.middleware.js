const Subscription = require('../models/Subscription.model');
const User = require('../models/User.model');
const Plan = require('../models/Plan.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const validateSubscription = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // Free users can proceed (with limited access)
  if (!user.currentPlan) {
    req.subscription = {
      plan: 'free',
      features: ['basic'],
      imageLimit: 3
    };
    return next();
  }

  // Find active subscription
  const subscription = await Subscription.findOne({
    userId: user._id,
    status: 'active'
  }).populate('planId');

  // If no active subscription found
  if (!subscription) {
    // Reset user to free plan
    user.currentPlan = null;
    user.imagesRemaining = 3;
    await user.save();

    req.subscription = {
      plan: 'free',
      features: ['basic'],
      imageLimit: 3
    };
    return next();
  }

  // Check if subscription is expired
  if (subscription.endDate < new Date()) {
    subscription.status = 'expired';
    await subscription.save();

    // Reset user to free plan
    user.currentPlan = null;
    user.imagesRemaining = 3;
    await user.save();

    throw new ApiError(
      403,
      'Your subscription has expired. Please renew to continue.',
      {
        expired: true,
        expiryDate: subscription.endDate
      }
    );
  }

  // Attach subscription details to request
  req.subscription = {
    id: subscription._id,
    plan: subscription.planId.name,
    features: subscription.planId.features,
    imageLimit: subscription.planId.imageLimit,
    imagesUsed: subscription.imagesUsed,
    imagesRemaining: subscription.planId.imageLimit - subscription.imagesUsed,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    autoRenew: subscription.autoRenew
  };

  next();
});

// Require active premium subscription
const requirePremium = asyncHandler(async (req, res, next) => {
  await validateSubscription(req, res, () => {});

  if (req.subscription.plan === 'free') {
    throw new ApiError(
      403,
      'This feature requires a premium subscription.',
      {
        requiredPlan: 'premium',
        currentPlan: 'free'
      }
    );
  }

  next();
});

// Require specific plan
const requirePlan = (planNames) => {
  return asyncHandler(async (req, res, next) => {
    await validateSubscription(req, res, () => {});

    const plans = Array.isArray(planNames) ? planNames : [planNames];
    
    if (!plans.includes(req.subscription.plan.toLowerCase())) {
      throw new ApiError(
        403,
        `This feature requires one of the following plans: ${plans.join(', ')}`,
        {
          requiredPlans: plans,
          currentPlan: req.subscription.plan
        }
      );
    }

    next();
  });
};

// Check feature access
const requireFeature = (featureName) => {
  return asyncHandler(async (req, res, next) => {
    await validateSubscription(req, res, () => {});

    if (!req.subscription.features.includes(featureName)) {
      throw new ApiError(
        403,
        `This feature is not available in your current plan.`,
        {
          requiredFeature: featureName,
          currentFeatures: req.subscription.features
        }
      );
    }

    next();
  });
};

module.exports = {
  validateSubscription,
  requirePremium,
  requirePlan,
  requireFeature
};