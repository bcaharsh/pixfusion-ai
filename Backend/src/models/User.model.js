const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false
    },
    phone: {
      type: String,
      default: null
    },
    avatar: {
      type: String,
      default: null
    },
    avatarPublicId: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: 500,
      default: null
    },
    currentPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      default: null
    },
    imagesRemaining: {
      type: Number,
      default: 3,
      min: 0
    },
    credits: {  // ✅ ADDED - Track credits separately
      type: Number,
      default: 3,
      min: 0
    },
    imagesGenerated: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      select: false
    },
    emailVerificationExpires: {
      type: Date,
      select: false
    },
    resetPasswordToken: {
      type: String,
      select: false
    },
    resetPasswordExpires: {
      type: Date,
      select: false
    },
    passwordChangedAt: {
      type: Date,
      select: false
    },
    lastLogin: {
      type: Date,
      default: null
    },
    role: {
      type: String,
      enum: ['user', 'premium', 'admin'],
      default: 'user'
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      marketingEmails: {
        type: Boolean,
        default: false
      },
      defaultImageStyle: {
        type: String,
        default: 'general'
      },
      privateByDefault: {
        type: Boolean,
        default: false
      }
    },
    notes: {
      type: String,
      default: null,
      select: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ currentPlan: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_ROUNDS) || 10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hide sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.notes;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;