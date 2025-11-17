const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const axios = require('axios');

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  const config = cloudinary.config();
  return config.cloud_name && 
         config.cloud_name !== 'demo' && 
         config.api_key && 
         config.api_key !== '123456789';
};

const cloudinaryService = {
  // Upload image from buffer
  uploadImage: async (buffer, folder = 'generations') => {
    if (!isCloudinaryConfigured()) {
      throw new ApiError(500, 'Cloudinary is not configured. Please add credentials to .env file.');
    }

    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `${process.env.CLOUDINARY_FOLDER || 'image9'}/${folder}`,
            resource_type: 'image',
            quality: 'auto',
            fetch_format: 'auto'
          },
          (error, result) => {
            if (error) {
              logger.error('Cloudinary upload error:', error);
              reject(new ApiError(500, 'Failed to upload image to cloud storage'));
            } else {
              logger.info('Image uploaded successfully to Cloudinary', {
                public_id: result.public_id
              });
              resolve(result);
            }
          }
        );

        uploadStream.end(buffer);
      });
    } catch (error) {
      logger.error('Cloudinary upload error:', error);
      throw new ApiError(500, 'Failed to upload image');
    }
  },

  // Upload image from URL
  uploadImageFromUrl: async (imageUrl, folder = 'generations') => {
    if (!isCloudinaryConfigured()) {
      throw new ApiError(500, 'Cloudinary is not configured. Please add credentials to .env file.');
    }

    try {
      // Download image from URL
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      const buffer = Buffer.from(response.data);

      // Upload to Cloudinary
      const result = await cloudinaryService.uploadImage(buffer, folder);
      
      return result;
    } catch (error) {
      logger.error('Error uploading image from URL:', error);
      throw new ApiError(500, 'Failed to upload image from URL');
    }
  },

  // Delete image
  deleteImage: async (publicId) => {
    if (!isCloudinaryConfigured()) {
      logger.warn('Cloudinary not configured, skipping image deletion');
      return false;
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        logger.info('Image deleted successfully from Cloudinary', { publicId });
        return true;
      } else {
        logger.warn('Image deletion failed or image not found', { publicId });
        return false;
      }
    } catch (error) {
      logger.error('Cloudinary delete error:', error);
      throw new ApiError(500, 'Failed to delete image');
    }
  },

  // Delete multiple images
  deleteMultipleImages: async (publicIds) => {
    if (!isCloudinaryConfigured()) {
      logger.warn('Cloudinary not configured, skipping bulk deletion');
      return { deleted: {} };
    }

    try {
      const result = await cloudinary.api.delete_resources(publicIds);
      logger.info('Multiple images deleted from Cloudinary', {
        count: publicIds.length
      });
      return result;
    } catch (error) {
      logger.error('Cloudinary bulk delete error:', error);
      throw new ApiError(500, 'Failed to delete images');
    }
  },

  // Get image details
  getImageDetails: async (publicId) => {
    if (!isCloudinaryConfigured()) {
      throw new ApiError(500, 'Cloudinary is not configured');
    }

    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      logger.error('Error getting image details:', error);
      throw new ApiError(500, 'Failed to get image details');
    }
  },

  // Generate transformation URL
  getTransformationUrl: (publicId, transformations = {}) => {
    if (!isCloudinaryConfigured()) {
      throw new ApiError(500, 'Cloudinary is not configured');
    }

    try {
      const url = cloudinary.url(publicId, {
        ...transformations,
        secure: true
      });
      return url;
    } catch (error) {
      logger.error('Error generating transformation URL:', error);
      throw new ApiError(500, 'Failed to generate image URL');
    }
  },

  // Check if configured
  isConfigured: isCloudinaryConfigured
};

module.exports = cloudinaryService;