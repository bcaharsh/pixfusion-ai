const cron = require('node-cron');
const Subscription = require('../models/Subscription.model');
const User = require('../models/User.model');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

// Check for expiring subscriptions daily at 00:00
const subscriptionExpiryJob = cron.schedule('0 0 * * *', async () => {
  try {
    logger.info('Running subscription expiry check job...');

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find subscriptions expiring in 3 days
    const expiringIn3Days = await Subscription.find({
      endDate: {
        $gte: threeDaysFromNow,
        $lt: new Date(threeDaysFromNow.getTime() + 24 * 60 * 60 * 1000)
      },
      status: 'active',
      autoRenew: false
    }).populate('userId planId');

    // Find subscriptions expiring in 1 day
    const expiringIn1Day = await Subscription.find({
      endDate: {
        $gte: oneDayFromNow,
        $lt: new Date(oneDayFromNow.getTime() + 24 * 60 * 60 * 1000)
      },
      status: 'active',
      autoRenew: false
    }).populate('userId planId');

    // Find expired subscriptions
    const expiredSubscriptions = await Subscription.find({
      endDate: { $lt: now },
      status: 'active'
    }).populate('userId planId');

    // Send 3-day warning emails
    for (const subscription of expiringIn3Days) {
      await emailService.sendSubscriptionExpiryWarning(
        subscription.userId.email,
        subscription.userId.name,
        subscription.planId.name,
        subscription.endDate,
        3
      );
      logger.info(`Sent 3-day expiry warning to ${subscription.userId.email}`);
    }

    // Send 1-day warning emails
    for (const subscription of expiringIn1Day) {
      await emailService.sendSubscriptionExpiryWarning(
        subscription.userId.email,
        subscription.userId.name,
        subscription.planId.name,
        subscription.endDate,
        1
      );
      logger.info(`Sent 1-day expiry warning to ${subscription.userId.email}`);
    }

    // Handle expired subscriptions
    for (const subscription of expiredSubscriptions) {
      subscription.status = 'expired';
      await subscription.save();

      // Reset user to free plan
      const user = subscription.userId;
      user.currentPlan = null;
      user.imagesRemaining = 3; // Free plan limit
      await user.save();

      await emailService.sendSubscriptionExpired(
        user.email,
        user.name,
        subscription.planId.name
      );
      
      logger.info(`Expired subscription for ${user.email}`);
    }

    logger.info(`Subscription expiry job completed. 
      3-day warnings: ${expiringIn3Days.length}, 
      1-day warnings: ${expiringIn1Day.length}, 
      Expired: ${expiredSubscriptions.length}`);

  } catch (error) {
    logger.error('Error in subscription expiry job:', error);
  }
});

// Reset monthly usage on the 1st of each month at 00:00
const monthlyUsageResetJob = cron.schedule('0 0 1 * *', async () => {
  try {
    logger.info('Running monthly usage reset job...');

    const activeSubscriptions = await Subscription.find({
      status: 'active',
      'billingCycle': 'monthly'
    }).populate('userId planId');

    for (const subscription of activeSubscriptions) {
      const user = subscription.userId;
      const plan = subscription.planId;

      user.imagesRemaining = plan.imageLimit;
      await user.save();

      logger.info(`Reset monthly usage for ${user.email}`);
    }

    logger.info(`Monthly usage reset completed for ${activeSubscriptions.length} users`);
  } catch (error) {
    logger.error('Error in monthly usage reset job:', error);
  }
});

module.exports = {
  subscriptionExpiryJob,
  monthlyUsageResetJob
};