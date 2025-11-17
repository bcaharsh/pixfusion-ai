const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { adminAuth, checkPermission, isSuperAdmin } = require('../middleware/adminAuth.middleware');
const validate = require('../middleware/validate.middleware');
const adminValidation = require('../validations/admin.validation');
const { adminLimiter } = require('../middleware/rateLimiter.middleware');

// All routes require admin authentication
router.use(adminAuth);
router.use(adminLimiter);

// Dashboard
router.get(
  '/dashboard',
  validate(adminValidation.getStatistics),
  adminController.getDashboardStats
);

// User management
router.get(
  '/users',
  checkPermission('manage_users'),
  validate(adminValidation.listUsers),
  adminController.getUsers
);

router.get(
  '/users/:id',
  checkPermission('manage_users'),
  adminController.getUserById
);

router.put(
  '/users/:id',
  checkPermission('manage_users'),
  validate(adminValidation.updateUser),
  adminController.updateUser
);

router.delete(
  '/users/:id',
  checkPermission('manage_users'),
  validate(adminValidation.deleteUser),
  adminController.deleteUser
);

// Generation management
router.get(
  '/generations',
  checkPermission('manage_content'),
  validate(adminValidation.listGenerations),
  adminController.getGenerations
);

router.delete(
  '/generations/:id',
  checkPermission('manage_content'),
  adminController.deleteGeneration
);

// Subscription management
router.get(
  '/subscriptions',
  checkPermission('manage_subscriptions'),
  adminController.getSubscriptions
);

// Payment management
router.get(
  '/payments',
  checkPermission('manage_payments'),
  adminController.getPayments
);

// Plan management
router.get('/plans', adminController.getPlans);

router.post(
  '/plans',
  checkPermission('manage_plans'),
  validate(adminValidation.createPlan),
  adminController.createPlan
);

router.put(
  '/plans/:id',
  checkPermission('manage_plans'),
  validate(adminValidation.updatePlan),
  adminController.updatePlan
);

router.delete(
  '/plans/:id',
  checkPermission('manage_plans'),
  adminController.deletePlan
);

// Admin management (Superadmin only)
router.get('/admins', isSuperAdmin, adminController.getAdmins);

router.post(
  '/admins',
  isSuperAdmin,
  validate(adminValidation.createAdmin),
  adminController.createAdmin
);

router.put('/admins/:id', isSuperAdmin, adminController.updateAdmin);

router.delete('/admins/:id', isSuperAdmin, adminController.deleteAdmin);

// System settings
router.get('/settings', isSuperAdmin, adminController.getSystemSettings);

router.put('/settings', isSuperAdmin, adminController.updateSystemSettings);

module.exports = router;