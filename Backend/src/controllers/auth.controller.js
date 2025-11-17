const authService = require('../services/auth.service');
const emailService = require('../services/email.service');
const User = require('../models/User.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const authController = {
  // Register new user
  register: asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(400, 'Email already registered');
    }

    // Create user
    const user = await authService.registerUser({ name, email, password });

    // Generate tokens
    const { accessToken, refreshToken } = authService.generateTokens(user._id);

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    res.status(201).json(
      new ApiResponse(201, {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          imagesRemaining: user.imagesRemaining,
          currentPlan: user.currentPlan
        },
        accessToken,
        refreshToken
      }, 'Registration successful')
    );
  }),

  // Login user
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(403, 'Your account has been deactivated. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate tokens
    const { accessToken, refreshToken } = authService.generateTokens(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    res.json(
      new ApiResponse(200, {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          imagesRemaining: user.imagesRemaining,
          imagesGenerated: user.imagesGenerated,
          currentPlan: user.currentPlan,
          avatar: user.avatar
        },
        accessToken,
        refreshToken
      }, 'Login successful')
    );
  }),

  // Refresh access token
  refreshToken: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token is required');
    }

    const tokens = await authService.refreshAccessToken(refreshToken);

    res.json(
      new ApiResponse(200, tokens, 'Token refreshed successfully')
    );
  }),

  // Logout user
  logout: asyncHandler(async (req, res) => {
    // In a stateless JWT setup, logout is handled client-side
    // But we can blacklist the token if using Redis
    
    res.json(
      new ApiResponse(200, null, 'Logout successful')
    );
  }),

  // Get current user
  getCurrentUser: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate('currentPlan');

    res.json(
      new ApiResponse(200, {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          bio: user.bio,
          imagesRemaining: user.imagesRemaining,
          imagesGenerated: user.imagesGenerated,
          currentPlan: user.currentPlan,
          preferences: user.preferences,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }, 'User retrieved successfully')
    );
  }),

  // Forgot password
  forgotPassword: asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json(
        new ApiResponse(200, null, 'If the email exists, a password reset link has been sent')
      );
    }

    // Generate reset token
    const resetToken = authService.generateResetToken();
    
    // Save hashed token and expiry
    user.resetPasswordToken = authService.hashToken(resetToken);
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
      
      res.json(
        new ApiResponse(200, null, 'Password reset email sent successfully')
      );
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      throw new ApiError(500, 'Failed to send password reset email. Please try again.');
    }
  }),

  // Reset password
  resetPassword: asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    // Hash the token to compare with stored hash
    const hashedToken = authService.hashToken(token);

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();

    // Send confirmation email
    try {
      await emailService.sendPasswordChangedEmail(user.email, user.name);
    } catch (error) {
      console.error('Failed to send password changed email:', error);
    }

    // Generate new tokens
    const { accessToken, refreshToken } = authService.generateTokens(user._id);

    res.json(
      new ApiResponse(200, {
        accessToken,
        refreshToken
      }, 'Password reset successful')
    );
  }),

  // Change password
  changePassword: asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    // Send confirmation email
    try {
      await emailService.sendPasswordChangedEmail(user.email, user.name);
    } catch (error) {
      console.error('Failed to send password changed email:', error);
    }

    res.json(
      new ApiResponse(200, null, 'Password changed successfully')
    );
  }),

  // Verify email (if implementing email verification)
  verifyEmail: asyncHandler(async (req, res) => {
    const { token } = req.body;

    const hashedToken = authService.hashToken(token);

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json(
      new ApiResponse(200, null, 'Email verified successfully')
    );
  })
};

module.exports = authController;