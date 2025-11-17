const cron = require('node-cron');
const Generation = require('../models/Generation.model');
const cloudinaryService = require('../services/cloudinary.service');
const logger = require('../utils/logger');

// Clean up old failed/temporary images every day at 02:00
const imageCleanupJob = cron.schedule('0 2 * * *', async () => {
  try {
    logger.info('Running image cleanup job...');

    // Delete failed generations older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const failedGenerations = await Generation.find({
      status: 'failed',
      createdAt: { $lt: sevenDaysAgo }
    });

    for (const generation of failedGenerations) {
      if (generation.imageUrl && generation.publicId) {
        try {
          await cloudinaryService.deleteImage(generation.publicId);
          logger.info(`Deleted failed generation image: ${generation.publicId}`);
        } catch (error) {
          logger.error(`Failed to delete image ${generation.publicId}:`, error);
        }
      }
      await generation.deleteOne();
    }

    // Delete orphaned temporary images older than 1 day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const tempGenerations = await Generation.find({
      status: 'processing',
      createdAt: { $lt: oneDayAgo }
    });

    for (const generation of tempGenerations) {
      generation.status = 'failed';
      generation.error = 'Generation timeout - cleaned up by system';
      await generation.save();
    }

    logger.info(`Image cleanup completed. 
      Failed generations deleted: ${failedGenerations.length}, 
      Timed out generations: ${tempGenerations.length}`);

  } catch (error) {
    logger.error('Error in image cleanup job:', error);
  }
});

// Clean up old completed generations (optional - keep last 90 days)
const oldGenerationCleanupJob = cron.schedule('0 3 1 * *', async () => {
  try {
    logger.info('Running old generation cleanup job...');

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    const oldGenerations = await Generation.find({
      createdAt: { $lt: ninetyDaysAgo },
      userId: { $exists: true }
    });

    let deletedCount = 0;

    for (const generation of oldGenerations) {
      if (generation.imageUrl && generation.publicId) {
        try {
          await cloudinaryService.deleteImage(generation.publicId);
          await generation.deleteOne();
          deletedCount++;
        } catch (error) {
          logger.error(`Failed to delete old generation ${generation._id}:`, error);
        }
      }
    }

    logger.info(`Old generation cleanup completed. Deleted: ${deletedCount} generations`);

  } catch (error) {
    logger.error('Error in old generation cleanup job:', error);
  }
});

module.exports = {
  imageCleanupJob,
  oldGenerationCleanupJob
};