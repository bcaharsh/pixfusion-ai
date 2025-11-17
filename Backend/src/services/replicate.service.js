const Replicate = require('replicate');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const replicateService = {
  // Generate image using Ideogram V3 Quality
  generateImage: async ({
    prompt,
    negativePrompt,
    styleType = 'general',
    magicPromptOption = 'Auto',
    aspectRatio = '1:1',
    seed = null
  }) => {
    try {
      logger.info('Starting image generation with Replicate', { prompt });

      const input = {
        prompt,
        aspect_ratio: aspectRatio,
        style_type: styleType,
        magic_prompt_option: magicPromptOption
      };

      // Add optional parameters
      if (negativePrompt) {
        input.negative_prompt = negativePrompt;
      }

      if (seed !== null && seed !== undefined) {
        input.seed = seed;
      }

      const output = await replicate.run(
        process.env.REPLICATE_MODEL || "ideogram-ai/ideogram-v3-quality",
        { input }
      );

      // Ideogram returns array of image URLs
      const imageUrl = Array.isArray(output) ? output[0] : output;

      if (!imageUrl) {
        throw new ApiError(500, 'Failed to generate image - no output received');
      }

      logger.info('Image generation completed successfully', { imageUrl });
      return imageUrl;

    } catch (error) {
      logger.error('Replicate image generation error:', error);
      
      if (error.message.includes('Incorrect API key')) {
        throw new ApiError(500, 'Replicate API configuration error');
      }
      
      if (error.message.includes('rate limit')) {
        throw new ApiError(429, 'Rate limit exceeded. Please try again later.');
      }

      throw new ApiError(500, `Image generation failed: ${error.message}`);
    }
  },

  // Get prediction status
  getPredictionStatus: async (predictionId) => {
    try {
      const prediction = await replicate.predictions.get(predictionId);
      return {
        status: prediction.status,
        output: prediction.output,
        error: prediction.error
      };
    } catch (error) {
      logger.error('Error getting prediction status:', error);
      throw new ApiError(500, 'Failed to get generation status');
    }
  },

  // Cancel prediction
  cancelPrediction: async (predictionId) => {
    try {
      await replicate.predictions.cancel(predictionId);
      logger.info('Prediction cancelled:', predictionId);
      return true;
    } catch (error) {
      logger.error('Error cancelling prediction:', error);
      throw new ApiError(500, 'Failed to cancel generation');
    }
  }
};

module.exports = replicateService;