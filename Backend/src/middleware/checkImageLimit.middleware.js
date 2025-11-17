const User = require('../models/User.model');
const Subscription = require('../models/Subscription.model');
const Plan = require('../models/Plan.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const checkImageLimit = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('currentPlan');

  // Check if user has images remaining
  if (user.imagesRemaining <= 0) {
    // Check if user has an active subscription
    const activeSubscription = await Subscription.findOne({
      userId: user._id,
      status: 'active',
      endDate: { $gt: new Date() }
    }).populate('planId');

    if (!activeSubscription) {
      throw new ApiError(
        403,
        'Image generation limit reached. Please upgrade your plan to continue.',
        {
          limitReached: true,
          imagesRemaining: 0,
          suggestedAction: 'upgrade'
        }
      );
    }

    // Check subscription limit
    if (activeSubscription.imagesUsed >= activeSubscription.planId.imageLimit) {
      throw new ApiError(
        403,
        'Monthly image generation limit reached. Please upgrade your plan or wait for the next billing cycle.',
        {
          limitReached: true,
          imagesRemaining: 0,
          resetDate: activeSubscription.endDate,
          suggestedAction: 'upgrade'
        }
      );
    }
  }

  // Add user's image limit info to request
  req.imageLimit = {
    remaining: user.imagesRemaining,
    total: user.currentPlan ? user.currentPlan.imageLimit : 3
  };

  next();
});

// Check if user can generate specific number of images (for batch operations)
const checkBatchLimit = (count) => {
  return asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (user.imagesRemaining < count) {
      throw new ApiError(
        403,
        `Not enough images remaining. You need ${count} images but only have ${user.imagesRemaining} remaining.`,
        {
          required: count,
          available: user.imagesRemaining,
          shortage: count - user.imagesRemaining
        }
      );
    }

    next();
  });
};

module.exports = { checkImageLimit, checkBatchLimit };