const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');

const authService = {
  // Generate JWT tokens
  generateTokens: (userId) => {
    const accessToken = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    return { accessToken, refreshToken };
  },

  // Register new user
  registerUser: async ({ name, email, password }) => {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(400, 'Email already registered');
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      imagesRemaining: 3,
      credits: 3,
      role: 'user'
    });

    return user;
  },

  // Verify refresh token and generate new access token
  refreshAccessToken: async (refreshToken) => {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new ApiError(401, 'User not found');
      }

      if (!user.isActive) {
        throw new ApiError(403, 'Account is deactivated');
      }

      const { accessToken, refreshToken: newRefreshToken } = authService.generateTokens(user._id);

      return {
        accessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new ApiError(401, 'Invalid refresh token');
    }
  },

  // Generate password reset token
  generateResetToken: () => {
    return crypto.randomBytes(32).toString('hex');
  },

  // Hash token for storage
  hashToken: (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
  },

  // Generate email verification token
  generateVerificationToken: () => {
    return crypto.randomBytes(32).toString('hex');
  }
};

module.exports = authService;