const mongoose = require('mongoose');

const generationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  prompt: {
    type: String,
    required: true,
    maxlength: 1000
  },
  negativePrompt: {
    type: String,
    maxlength: 1000,
    default: null
  },
  model: {
    type: String,
    required: true,
    default: 'ideogram-ai/ideogram-v2'
  },
  parameters: {
    resolution: {
      type: String,
      default: '1:1'
    },
    magicPromptOption: {
      type: String,
      enum: ['auto', 'on', 'off'],
      default: 'auto'
    },
    styleType: {
      type: String,
      enum: ['auto', 'general', 'realistic', 'design', 'render_3d', 'anime'],
      default: 'auto'
    },
    seed: {
      type: Number,
      default: null
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  cloudinaryPublicId: {
    type: String,
    default: null
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  replicatePredictionId: {
    type: String,
    default: null
  },
  error: {
    type: String,
    default: null
  },
  processingTime: {
    type: Number, // in seconds
    default: null
  },
  creditsUsed: {
    type: Number,
    default: 1
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    dimensions: {
      width: Number,
      height: Number
    },
    fileSize: Number
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
generationSchema.index({ user: 1, createdAt: -1 });
generationSchema.index({ status: 1, createdAt: -1 });
generationSchema.index({ replicatePredictionId: 1 });

// Mark as completed
generationSchema.methods.markAsCompleted = async function(imageUrl, cloudinaryPublicId, metadata = {}) {
  this.status = 'completed';
  this.imageUrl = imageUrl;
  this.cloudinaryPublicId = cloudinaryPublicId;
  if (metadata.dimensions) this.metadata.dimensions = metadata.dimensions;
  if (metadata.fileSize) this.metadata.fileSize = metadata.fileSize;
  return await this.save();
};

// Mark as failed
generationSchema.methods.markAsFailed = async function(error) {
  this.status = 'failed';
  this.error = error;
  return await this.save();
};

module.exports = mongoose.model('Generation', generationSchema);