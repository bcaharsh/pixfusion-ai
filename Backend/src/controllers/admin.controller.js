const User = require('../models/User.model');
const Generation = require('../models/Generation.model');
const Subscription = require('../models/Subscription.model');
const Payment = require('../models/Payment.model');
const Plan = require('../models/Plan.model');
const Admin = require('../models/Admin.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const adminController = {
  // Get dashboard statistics
  getDashboardStats: asyncHandler(async (req, res) => {
    const { period = 'month' } = req.query;

    let startDate = new Date();
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
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
        startDate = new Date(0); // All time
    }

    // Total users
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Active subscriptions
    const activeSubscriptions = await Subscription.countDocuments({
      status: 'active'
    });

    // Total revenue
    const revenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalRevenue = revenue[0]?.total || 0;

    // Total generations
    const totalGenerations = await Generation.countDocuments();
    const newGenerations = await Generation.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Success rate
    const completedGenerations = await Generation.countDocuments({
      status: 'completed',
      createdAt: { $gte: startDate }
    });
    const successRate = newGenerations > 0
      ? (completedGenerations / newGenerations * 100).toFixed(2)
      : 0;

    // Popular plans
    const popularPlans = await Subscription.aggregate([
      {
        $match: {
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$planId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'plans',
          localField: '_id',
          foreignField: '_id',
          as: 'plan'
        }
      },
      {
        $unwind: '$plan'
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Recent activities
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    const recentPayments = await Payment.find()
      .populate('userId', 'name email')
      .populate('planId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Chart data - Daily stats for the period
    const dailyStats = await Generation.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json(
      new ApiResponse(200, {
        period,
        overview: {
          totalUsers,
          newUsers,
          activeSubscriptions,
          totalRevenue,
          totalGenerations,
          newGenerations,
          successRate
        },
        popularPlans,
        recentUsers,
        recentPayments,
        dailyStats
      }, 'Dashboard statistics retrieved successfully')
    );
  }),

  // Get all users
  getUsers: asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const users = await User.find(query)
      .populate('currentPlan', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password')
      .exec();

    const count = await User.countDocuments(query);

    res.json(
      new ApiResponse(200, {
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        total: count
      }, 'Users retrieved successfully')
    );
  }),

  // Get user by ID
  getUserById: asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
      .populate('currentPlan')
      .select('-password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Get user statistics
    const totalGenerations = await Generation.countDocuments({ userId: user._id });
    const activeSubscription = await Subscription.findOne({
      userId: user._id,
      status: 'active'
    }).populate('planId');

    const payments = await Payment.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(
      new ApiResponse(200, {
        user,
        stats: {
          totalGenerations,
          activeSubscription
        },
        recentPayments: payments
      }, 'User retrieved successfully')
    );
  }),

  // Update user
  updateUser: asyncHandler(async (req, res) => {
    const { isActive, imagesRemaining, role, notes } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (imagesRemaining !== undefined) user.imagesRemaining = imagesRemaining;
    if (role) user.role = role;
    if (notes !== undefined) user.notes = notes;

    await user.save();

    res.json(
      new ApiResponse(200, { user }, 'User updated successfully')
    );
  }),

  // Delete user
  deleteUser: asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Delete all user's generations
    await Generation.deleteMany({ userId: user._id });

    // Cancel subscriptions
    await Subscription.updateMany(
      { userId: user._id, status: 'active' },
      { status: 'cancelled', cancelledAt: new Date() }
    );

    // Delete user
    await user.deleteOne();

    res.json(
      new ApiResponse(200, null, 'User deleted successfully')
    );
  }),

  // Get all generations
  getGenerations: asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      userId,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (userId) query.userId = userId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const generations = await Generation.find(query)
      .populate('userId', 'name email')
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
      }, 'Generations retrieved successfully')
    );
  }),

  // Delete generation
  deleteGeneration: asyncHandler(async (req, res) => {
    const generation = await Generation.findById(req.params.id);
    if (!generation) {
      throw new ApiError(404, 'Generation not found');
    }

    await generation.deleteOne();

    res.json(
      new ApiResponse(200, null, 'Generation deleted successfully')
    );
  }),

  // Get all subscriptions
  getSubscriptions: asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status) query.status = status;

    const subscriptions = await Subscription.find(query)
      .populate('userId', 'name email')
      .populate('planId', 'name price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Subscription.countDocuments(query);

    res.json(
      new ApiResponse(200, {
        subscriptions,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        total: count
      }, 'Subscriptions retrieved successfully')
    );
  }),

  // Get all payments
  getPayments: asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('userId', 'name email')
      .populate('planId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Payment.countDocuments(query);

    res.json(
      new ApiResponse(200, {
        payments,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        total: count
      }, 'Payments retrieved successfully')
    );
  }),

  // Plans management
  getPlans: asyncHandler(async (req, res) => {
    const plans = await Plan.find().sort({ priority: 1 });

    res.json(
      new ApiResponse(200, { plans }, 'Plans retrieved successfully')
    );
  }),

  createPlan: asyncHandler(async (req, res) => {
    const plan = await Plan.create(req.body);

    res.status(201).json(
      new ApiResponse(201, { plan }, 'Plan created successfully')
    );
  }),

  updatePlan: asyncHandler(async (req, res) => {
    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!plan) {
      throw new ApiError(404, 'Plan not found');
    }

    res.json(
      new ApiResponse(200, { plan }, 'Plan updated successfully')
    );
  }),

  deletePlan: asyncHandler(async (req, res) => {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      throw new ApiError(404, 'Plan not found');
    }

    // Check if plan is in use
    const subscriptionsCount = await Subscription.countDocuments({
      planId: plan._id,
      status: 'active'
    });

    if (subscriptionsCount > 0) {
      throw new ApiError(400, 'Cannot delete plan with active subscriptions');
    }

    await plan.deleteOne();

    res.json(
      new ApiResponse(200, null, 'Plan deleted successfully')
    );
  }),

  // Admin management
  getAdmins: asyncHandler(async (req, res) => {
    const admins = await Admin.find().select('-password');

    res.json(
      new ApiResponse(200, { admins }, 'Admins retrieved successfully')
    );
  }),

  createAdmin: asyncHandler(async (req, res) => {
    const { name, email, password, role, permissions } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      throw new ApiError(400, 'Admin with this email already exists');
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'admin',
      permissions: permissions || []
    });

    res.status(201).json(
      new ApiResponse(201, {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      }, 'Admin created successfully')
    );
  }),

  updateAdmin: asyncHandler(async (req, res) => {
    const { name, role, permissions, isActive } = req.body;

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      throw new ApiError(404, 'Admin not found');
    }

    if (name) admin.name = name;
    if (role) admin.role = role;
    if (permissions) admin.permissions = permissions;
    if (isActive !== undefined) admin.isActive = isActive;

    await admin.save();

    res.json(
      new ApiResponse(200, {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          isActive: admin.isActive
        }
      }, 'Admin updated successfully')
    );
  }),

  deleteAdmin: asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      throw new ApiError(404, 'Admin not found');
    }

    // Prevent deleting yourself
    if (admin._id.toString() === req.admin.id) {
      throw new ApiError(400, 'You cannot delete your own account');
    }

    await admin.deleteOne();

    res.json(
      new ApiResponse(200, null, 'Admin deleted successfully')
    );
  }),

  // System settings
  getSystemSettings: asyncHandler(async (req, res) => {
    // This would typically fetch from a settings collection
    // For now, return environment-based settings
    const settings = {
      siteName: process.env.APP_NAME || 'Image9',
      maintenanceMode: false,
      allowRegistration: true,
      defaultImageLimit: 3,
      maxImageLimit: 1000,
      supportEmail: process.env.ADMIN_EMAIL
    };

    res.json(
      new ApiResponse(200, { settings }, 'Settings retrieved successfully')
    );
  }),

  updateSystemSettings: asyncHandler(async (req, res) => {
    // Implementation for updating system settings
    // Store in database or config file

    res.json(
      new ApiResponse(200, { settings: req.body }, 'Settings updated successfully')
    );
  })
  
};

module.exports = adminController;