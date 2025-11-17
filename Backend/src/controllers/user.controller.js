const User = require('../models/User.model');
const Generation = require('../models/Generation.model');
const Subscription = require('../models/Subscription.model');
const cloudinaryService = require('../services/cloudinary.service');
const emailService = require('../services/email.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const userController = {
  // Get user profile
  getProfile: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
      .populate('currentPlan')
      .select('-password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json(
      new ApiResponse(200, { user }, 'Profile retrieved successfully')
    );
  }),

  // Update user profile
  updateProfile: asyncHandler(async (req, res) => {
    const { name, phone, bio, preferences } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Update fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json(
      new ApiResponse(200, {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          bio: user.bio,
          avatar: user.avatar,
          preferences: user.preferences
        }
      }, 'Profile updated successfully')
    );
  }),

  // Upload avatar
  uploadAvatar: asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, 'Please upload an image');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Delete old avatar if exists
    if (user.avatarPublicId) {
      try {
        await cloudinaryService.deleteImage(user.avatarPublicId);
      } catch (error) {
        console.error('Failed to delete old avatar:', error);
      }
    }

    // Upload new avatar
    const result = await cloudinaryService.uploadImage(
      req.file.buffer,
      'avatars'
    );

    user.avatar = result.secure_url;
    user.avatarPublicId = result.public_id;
    await user.save();

    res.json(
      new ApiResponse(200, {
        avatar: user.avatar
      }, 'Avatar uploaded successfully')
    );
  }),

  // Delete avatar
  deleteAvatar: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.avatarPublicId) {
      await cloudinaryService.deleteImage(user.avatarPublicId);
    }

    user.avatar = null;
    user.avatarPublicId = null;
    await user.save();

    res.json(
      new ApiResponse(200, null, 'Avatar deleted successfully')
    );
  }),

  // Get user statistics
  getStatistics: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate('currentPlan');

    const totalGenerations = await Generation.countDocuments({
      userId: req.user.id
    });

    const completedGenerations = await Generation.countDocuments({
      userId: req.user.id,
      status: 'completed'
    });

    const failedGenerations = await Generation.countDocuments({
      userId: req.user.id,
      status: 'failed'
    });

    // Get current subscription
    const currentSubscription = await Subscription.findOne({
      userId: req.user.id,
      status: 'active'
    }).populate('planId');

    const stats = {
      totalGenerations,
      completedGenerations,
      failedGenerations,
      imagesRemaining: user.imagesRemaining,
      currentPlan: user.currentPlan ? user.currentPlan.name : 'Free',
      subscription: currentSubscription ? {
        plan: currentSubscription.planId.name,
        startDate: currentSubscription.startDate,
        endDate: currentSubscription.endDate,
        imagesUsed: currentSubscription.imagesUsed,
        imagesLimit: currentSubscription.planId.imageLimit
      } : null,
      memberSince: user.createdAt
    };

    res.json(
      new ApiResponse(200, stats, 'Statistics retrieved successfully')
    );
  }),

  // Get usage history
  getUsageHistory: asyncHandler(async (req, res) => {
    const { period = 'month' } = req.query;

    let startDate = new Date();
    switch (period) {
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

    const generations = await Generation.find({
      userId: req.user.id,
      createdAt: { $gte: startDate }
    }).select('createdAt status');

    // Group by date
    const usageByDate = {};
    generations.forEach(gen => {
      const date = gen.createdAt.toISOString().split('T')[0];
      if (!usageByDate[date]) {
        usageByDate[date] = { total: 0, completed: 0, failed: 0 };
      }
      usageByDate[date].total++;
      if (gen.status === 'completed') usageByDate[date].completed++;
      if (gen.status === 'failed') usageByDate[date].failed++;
    });

    res.json(
      new ApiResponse(200, {
        period,
        startDate,
        endDate: new Date(),
        totalGenerations: generations.length,
        usageByDate
      }, 'Usage history retrieved successfully')
    );
  }),

  // Update email
  updateEmail: asyncHandler(async (req, res) => {
    const { newEmail, password } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Incorrect password');
    }

    // Check if new email already exists
    const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingUser) {
      throw new ApiError(400, 'Email already in use');
    }

    const oldEmail = user.email;
    user.email = newEmail.toLowerCase();
    await user.save();

    // Send notification emails
    try {
      await emailService.sendEmailChangedNotification(oldEmail, user.name);
      await emailService.sendEmailChangedNotification(newEmail, user.name);
    } catch (error) {
      console.error('Failed to send email change notifications:', error);
    }

    res.json(
      new ApiResponse(200, { email: user.email }, 'Email updated successfully')
    );
  }),

  // Delete account
  deleteAccount: asyncHandler(async (req, res) => {
    const { password, confirmation } = req.body;

    if (confirmation !== 'DELETE') {
      throw new ApiError(400, 'Please type DELETE to confirm account deletion');
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Incorrect password');
    }

    // Cancel active subscriptions
    await Subscription.updateMany(
      { userId: user._id, status: 'active' },
      { status: 'cancelled', cancelledAt: new Date() }
    );

    // Delete all user's images from Cloudinary
    const generations = await Generation.find({ userId: user._id });
    for (const generation of generations) {
      if (generation.publicId) {
        try {
          await cloudinaryService.deleteImage(generation.publicId);
        } catch (error) {
          console.error('Failed to delete image:', error);
        }
      }
    }

    // Delete all generations
    await Generation.deleteMany({ userId: user._id });

    // Delete avatar
    if (user.avatarPublicId) {
      try {
        await cloudinaryService.deleteImage(user.avatarPublicId);
      } catch (error) {
        console.error('Failed to delete avatar:', error);
      }
    }

    // Delete user
    await user.deleteOne();

    // Send goodbye email
    try {
      await emailService.sendAccountDeletedEmail(user.email, user.name);
    } catch (error) {
      console.error('Failed to send account deleted email:', error);
    }

    res.json(
      new ApiResponse(200, null, 'Account deleted successfully')
    );
  }),

  // Get favorites
  getFavorites: asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    const favorites = await Generation.find({
      userId: req.user.id,
      isFavorite: true
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Generation.countDocuments({
      userId: req.user.id,
      isFavorite: true
    });

    res.json(
      new ApiResponse(200, {
        favorites,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count
      }, 'Favorites retrieved successfully')
    );
  }),

  // Update preferences
  updatePreferences: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.preferences = { ...user.preferences, ...req.body };
    await user.save();

    res.json(
      new ApiResponse(200, {
        preferences: user.preferences
      }, 'Preferences updated successfully')
    );
  })
};

module.exports = userController;