const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

// Configure Cloudinary
try {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Check if all required credentials are provided
  if (!cloudName || !apiKey || !apiSecret || 
      cloudName === 'demo' || apiKey === '123456789' || apiSecret === 'temporary-secret') {
    logger.warn('⚠️  Cloudinary credentials not configured properly. Image upload will not work.');
    logger.warn('Please add real Cloudinary credentials to .env file');
  } else {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });

    logger.info('✓ Cloudinary initialized successfully');
  }
} catch (error) {
  logger.error('Cloudinary connection failed:', error.message);
}

module.exports = cloudinary;