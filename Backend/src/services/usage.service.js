const User = require('../models/User.model');
const Subscription = require('../models/Subscription.model');
const Generation = require('../models/Generation.model');
const ApiError = require('../utils/ApiError');

const usageService = {
  // Record image generation
  recordImageGeneration: async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Deduct image from user's remaining count
    if (user.imagesRemaining > 0) {
      user.imagesRemaining -= 1;
    }

    // Deduct credit if tracking credits
    if (user.credits > 0) {
      user.credits -= 1;
    }

    // Increment total images generated
    user.imagesGenerated += 1;

    await user.save();

    // Update subscription usage if exists
    const activeSubscription = await Subscription.findOne({
      userId,
      status: 'active'
    });

    if (activeSubscription) {
      activeSubscription.imagesUsed += 1;
      await activeSubscription.save();
    }

    return {
      imagesRemaining: user.imagesRemaining,
      credits: user.credits,
      imagesGenerated: user.imagesGenerated
    };
  },

  // Check if user can generate images
  canGenerateImage: async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check both imagesRemaining and credits
    if (user.imagesRemaining <= 0 || user.credits <= 0) {
      return {
        canGenerate: false,
        reason: 'No images or credits remaining',
        imagesRemaining: user.imagesRemaining,
        credits: user.credits
      };
    }

    return {
      canGenerate: true,
      imagesRemaining: user.imagesRemaining,
      credits: user.credits
    };
  },

  // Get user usage statistics
  getUserUsage: async (userId, period = 'month') => {
    const user = await User.findById(userId).populate('currentPlan');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    let startDate = new Date();
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const generationsInPeriod = await Generation.countDocuments({
      userId,
      createdAt: { $gte: startDate }
    });

    const completedGenerations = await Generation.countDocuments({
      userId,
      status: 'completed',
      createdAt: { $gte: startDate }
    });

    return {
      period,
      imagesRemaining: user.imagesRemaining,
      credits: user.credits,
      imagesGenerated: user.imagesGenerated,
      generationsInPeriod,
      completedGenerations,
      currentPlan: user.currentPlan ? {
        name: user.currentPlan.name,
        displayName: user.currentPlan.displayName,
        imageLimit: user.currentPlan.imageLimit,
        credits: user.currentPlan.credits
      } : {
        name: 'free',
        displayName: 'Free',
        imageLimit: 3,
        credits: 3
      }
    };
  },

  // Reset monthly usage
  resetMonthlyUsage: async () => {
    const activeSubscriptions = await Subscription.find({
      status: 'active',
      billingCycle: 'monthly'
    }).populate('userId planId');

    let resetCount = 0;

    for (const subscription of activeSubscriptions) {
      const user = subscription.userId;
      const plan = subscription.planId;

      user.imagesRemaining = plan.imageLimit;
      user.credits = plan.credits;
      await user.save();

      subscription.imagesUsed = 0;
      await subscription.save();

      resetCount++;
    }

    return resetCount;
  }
};

module.exports = usageService;