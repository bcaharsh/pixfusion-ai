const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const adminAuth = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    throw new ApiError(401, 'Admin authentication required.');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if admin exists
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      throw new ApiError(401, 'Admin account no longer exists.');
    }

    // Check if admin is active
    if (!admin.isActive) {
      throw new ApiError(403, 'Admin account has been deactivated.');
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    // Attach admin to request
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid admin token.');
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Admin token expired.');
    }
    throw error;
  }
});

// Check specific permissions
const checkPermission = (permission) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.admin) {
      throw new ApiError(401, 'Admin authentication required.');
    }

    // Superadmin has all permissions
    if (req.admin.role === 'superadmin' || req.admin.permissions.includes('all')) {
      return next();
    }

    // Check if admin has the required permission
    if (!req.admin.permissions.includes(permission)) {
      throw new ApiError(403, `You don't have permission to ${permission}`);
    }

    next();
  });
};

// Check if superadmin
const isSuperAdmin = asyncHandler(async (req, res, next) => {
  if (!req.admin) {
    throw new ApiError(401, 'Admin authentication required.');
  }

  if (req.admin.role !== 'superadmin') {  // ✅ Changed from super_admin
    throw new ApiError(403, 'This action requires superadmin privileges.');
  }

  next();
});

module.exports = { adminAuth, checkPermission, isSuperAdmin };