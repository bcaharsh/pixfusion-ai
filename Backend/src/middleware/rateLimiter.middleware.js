const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    throw new ApiError(429, 'Too many requests, please try again later.');
  }
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    throw new ApiError(
      429,
      'Too many authentication attempts. Please try again after 15 minutes.'
    );
  }
});

// Image generation rate limiter
const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 generation requests per minute
  message: 'Too many image generation requests, please slow down.',
  handler: (req, res) => {
    throw new ApiError(
      429,
      'You are generating images too quickly. Please wait a moment before trying again.'
    );
  }
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: 'Too many password reset attempts, please try again later.',
  handler: (req, res) => {
    throw new ApiError(
      429,
      'Too many password reset attempts. Please try again after 1 hour.'
    );
  }
});

// Payment/Subscription rate limiter
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 payment requests per hour
  message: 'Too many payment requests, please try again later.',
  handler: (req, res) => {
    throw new ApiError(
      429,
      'Too many payment attempts. Please try again later.'
    );
  }
});

// Admin actions rate limiter
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each admin to 30 requests per minute
  message: 'Too many admin requests, please slow down.',
  handler: (req, res) => {
    throw new ApiError(429, 'Too many requests. Please slow down.');
  }
});

// Create custom rate limiter
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      throw new ApiError(429, message || 'Too many requests, please try again later.');
    }
  });
};

module.exports = {
  apiLimiter,
  authLimiter,
  generationLimiter,
  passwordResetLimiter,
  paymentLimiter,
  adminLimiter,
  createRateLimiter
};