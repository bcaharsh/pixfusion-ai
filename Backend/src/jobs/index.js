const { 
  subscriptionExpiryJob, 
  monthlyUsageResetJob 
} = require('./subscriptionExpiry.job');

const { 
  imageCleanupJob, 
  oldGenerationCleanupJob 
} = require('./imageCleanup.job');

const logger = require('../utils/logger');

const startJobs = () => {
  logger.info('Starting scheduled jobs...');

  // Start subscription-related jobs
  subscriptionExpiryJob.start();
  monthlyUsageResetJob.start();
  logger.info('✓ Subscription jobs started');

  // Start image cleanup jobs
  imageCleanupJob.start();
  oldGenerationCleanupJob.start();
  logger.info('✓ Image cleanup jobs started');

  logger.info('All scheduled jobs are running');
};

const stopJobs = () => {
  logger.info('Stopping scheduled jobs...');

  subscriptionExpiryJob.stop();
  monthlyUsageResetJob.stop();
  imageCleanupJob.stop();
  oldGenerationCleanupJob.stop();

  logger.info('All scheduled jobs stopped');
};

module.exports = {
  startJobs,
  stopJobs
};