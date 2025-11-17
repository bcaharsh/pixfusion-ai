const Generation = require('../models/Generation.model');
const User = require('../models/User.model');
const Subscription = require('../models/Subscription.model');
const replicateService = require('../services/replicate.service');
const cloudinaryService = require('../services/cloudinary.service');
const usageService = require('../services/usage.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const generationController = {
  // Create new image generation
  createGeneration: asyncHandler(async (req, res) => {
    const {
      prompt,
      negativePrompt,
      styleType,
      magicPromptOption,
      aspectRatio,
      seed,
      isPublic
    } = req.body;

    const user = await User.findById(req.user.id);

    // Create generation record
    const generation = await Generation.create({
      userId: req.user.id,
      prompt,
      negativePrompt,
      styleType: styleType || 'general',
      magicPromptOption: magicPromptOption || 'Auto',
      aspectRatio: aspectRatio || '1:1',
      seed: seed || null,
      isPublic: isPublic || false,
      status: 'pending'
    });

    // Start image generation in background
    (async () => {
      try {
        generation.status = 'processing';
        await generation.save();

        // Generate image using Replicate
        const imageUrl = await replicateService.generateImage({
          prompt,
          negativePrompt,
          styleType,
          magicPromptOption,
          aspectRatio,
          seed
        });

        // Upload to Cloudinary
        const uploadResult = await cloudinaryService.uploadImageFromUrl(
          imageUrl,
          `generations/${req.user.id}`
        );

        // Update generation record
        generation.imageUrl = uploadResult.secure_url;
        generation.publicId = uploadResult.public_id;
        generation.status = 'completed';
        generation.completedAt = new Date();
        await generation.save();

        // Update user usage
        await usageService.recordImageGeneration(req.user.id);

      } catch (error) {
        console.error('Generation error:', error);
        generation.status = 'failed';
        generation.error = error.message;
        await generation.save();

        // Refund the image credit
        user.imagesRemaining += 1;
        await user.save();
      }
    })();

    res.status(202).json(
      new ApiResponse(202, {
        generation: {
          id: generation._id,
          prompt: generation.prompt,
          status: generation.status,
          createdAt: generation.createdAt
        }
      }, 'Image generation started')
    );
  }),

  // Get generation by ID
  getGeneration: asyncHandler(async (req, res) => {
    const generation = await Generation.findById(req.params.id)
      .populate('userId', 'name avatar');

    if (!generation) {
      throw new ApiError(404, 'Generation not found');
    }

    // Check access permissions
    if (generation.userId._id.toString() !== req.user.id && !generation.isPublic) {
      throw new ApiError(403, 'You do not have permission to view this generation');
    }

    res.json(
      new ApiResponse(200, { generation }, 'Generation retrieved successfully')
    );
  }),

  // Get user's generation history
  getHistory: asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    const query = { userId: req.user.id };

    // Add filters
    if (status) query.status = status;
    if (search) {
      query.prompt = { $regex: search, $options: 'i' };
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const generations = await Generation.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Generation.countDocuments(query);

    res.json(
      new ApiResponse(200, {
        generations,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        total: count
      }, 'Generation history retrieved successfully')
    );
  }),

  // Get public generations (gallery)
  getPublicGenerations: asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, sortBy = 'createdAt' } = req.query;

    const generations = await Generation.find({
      isPublic: true,
      status: 'completed'
    })
      .populate('userId', 'name avatar')
      .sort({ [sortBy]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Generation.countDocuments({
      isPublic: true,
      status: 'completed'
    });

    res.json(
      new ApiResponse(200, {
        generations,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        total: count
      }, 'Public generations retrieved successfully')
    );
  }),

  // Update generation
  updateGeneration: asyncHandler(async (req, res) => {
    const { isPublic, isFavorite } = req.body;

    const generation = await Generation.findById(req.params.id);

    if (!generation) {
      throw new ApiError(404, 'Generation not found');
    }

    // Check ownership
    if (generation.userId.toString() !== req.user.id) {
      throw new ApiError(403, 'You do not have permission to update this generation');
    }

    if (isPublic !== undefined) generation.isPublic = isPublic;
    if (isFavorite !== undefined) generation.isFavorite = isFavorite;

    await generation.save();

    res.json(
      new ApiResponse(200, { generation }, 'Generation updated successfully')
    );
  }),

  // Delete generation
  deleteGeneration: asyncHandler(async (req, res) => {
    const generation = await Generation.findById(req.params.id);

    if (!generation) {
      throw new ApiError(404, 'Generation not found');
    }

    // Check ownership
    if (generation.userId.toString() !== req.user.id) {
      throw new ApiError(403, 'You do not have permission to delete this generation');
    }

    // Delete image from Cloudinary
    if (generation.publicId) {
      try {
        await cloudinaryService.deleteImage(generation.publicId);
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
      }
    }

    await generation.deleteOne();

    res.json(
      new ApiResponse(200, null, 'Generation deleted successfully')
    );
  }),

  // Batch delete generations
  batchDelete: asyncHandler(async (req, res) => {
    const { generationIds } = req.body;

    const generations = await Generation.find({
      _id: { $in: generationIds },
      userId: req.user.id
    });

    if (generations.length !== generationIds.length) {
      throw new ApiError(400, 'Some generations not found or you do not have permission');
    }

    // Delete images from Cloudinary
    for (const generation of generations) {
      if (generation.publicId) {
        try {
          await cloudinaryService.deleteImage(generation.publicId);
        } catch (error) {
          console.error('Failed to delete image:', error);
        }
      }
    }

    await Generation.deleteMany({
      _id: { $in: generationIds },
      userId: req.user.id
    });

    res.json(
      new ApiResponse(200, {
        deletedCount: generations.length
      }, 'Generations deleted successfully')
    );
  }),

  // Retry failed generation
  retryGeneration: asyncHandler(async (req, res) => {
    const generation = await Generation.findById(req.params.id);

    if (!generation) {
      throw new ApiError(404, 'Generation not found');
    }

    // Check ownership
    if (generation.userId.toString() !== req.user.id) {
      throw new ApiError(403, 'You do not have permission to retry this generation');
    }

    if (generation.status !== 'failed') {
      throw new ApiError(400, 'Only failed generations can be retried');
    }

    const user = await User.findById(req.user.id);

    // Check if user has images remaining
    if (user.imagesRemaining <= 0) {
      throw new ApiError(403, 'No images remaining. Please upgrade your plan.');
    }

    // Deduct image credit
    user.imagesRemaining -= 1;
    await user.save();

    // Reset generation status
    generation.status = 'pending';
    generation.error = null;
    await generation.save();

    // Retry generation in background
    (async () => {
      try {
        generation.status = 'processing';
        await generation.save();

        const imageUrl = await replicateService.generateImage({
          prompt: generation.prompt,
          negativePrompt: generation.negativePrompt,
          styleType: generation.styleType,
          magicPromptOption: generation.magicPromptOption,
          aspectRatio: generation.aspectRatio,
          seed: generation.seed
        });

        const uploadResult = await cloudinaryService.uploadImageFromUrl(
          imageUrl,
          `generations/${req.user.id}`
        );

        generation.imageUrl = uploadResult.secure_url;
        generation.publicId = uploadResult.public_id;
        generation.status = 'completed';
        generation.completedAt = new Date();
        await generation.save();

      } catch (error) {
        console.error('Retry generation error:', error);
        generation.status = 'failed';
        generation.error = error.message;
        await generation.save();

        // Refund the image credit
        user.imagesRemaining += 1;
        await user.save();
      }
    })();

    res.json(
      new ApiResponse(200, {
        generation: {
          id: generation._id,
          status: generation.status
        }
      }, 'Generation retry started')
    );
  }),

  // Get generation status
  getStatus: asyncHandler(async (req, res) => {
    const generation = await Generation.findById(req.params.id)
      .select('status error imageUrl createdAt completedAt');

    if (!generation) {
      throw new ApiError(404, 'Generation not found');
    }

    // Check ownership
    if (generation.userId.toString() !== req.user.id) {
      throw new ApiError(403, 'You do not have permission to view this generation');
    }

    res.json(
      new ApiResponse(200, { generation }, 'Generation status retrieved')
    );
  })
};

module.exports = generationController;