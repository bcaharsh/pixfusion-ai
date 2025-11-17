module.exports = {
  // Subscription Plans
  PLANS: {
    FREE: {
      name: 'Free',
      price: 0,
      credits: 5,
      features: [
        '5 image generations per month',
        'Basic quality images',
        'Standard generation speed',
        'Community support'
      ],
      stripePriceId: null
    },
    PRO: {
      name: 'Pro',
      price: 19.99,
      credits: 100,
      features: [
        '100 image generations per month',
        'High quality images',
        'Priority generation speed',
        'Email support',
        'Commercial usage rights',
        'HD downloads'
      ],
      stripePriceId: 'price_pro_monthly' // Replace with actual Stripe price ID
    },
    PREMIUM: {
      name: 'Premium',
      price: 49.99,
      credits: 300,
      features: [
        '300 image generations per month',
        'Ultra quality images',
        'Fastest generation speed',
        'Priority email support',
        'Commercial usage rights',
        'HD & 4K downloads',
        'API access',
        'Custom styles'
      ],
      stripePriceId: 'price_premium_monthly' // Replace with actual Stripe price ID
    }
  },

  // Image Generation Settings
  IMAGE_SETTINGS: {
    MODELS: {
      IDEOGRAM_V3: 'ideogram-ai/ideogram-v2'
    },
    DEFAULT_MODEL: 'ideogram-ai/ideogram-v2',
    MAX_PROMPT_LENGTH: 1000,
    SUPPORTED_RESOLUTIONS: ['1:1', '16:9', '9:16', '4:3', '3:4'],
    DEFAULT_RESOLUTION: '1:1',
    MAGIC_PROMPT_OPTIONS: ['auto', 'on', 'off'],
    STYLE_TYPES: ['auto', 'general', 'realistic', 'design', 'render_3d', 'anime']
  },

  // User Roles
  USER_ROLES: {
    USER: 'user',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin'
  },

  // Subscription Status
  SUBSCRIPTION_STATUS: {
    ACTIVE: 'active',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    TRIAL: 'trial',
    PAST_DUE: 'past_due'
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    SUCCEEDED: 'succeeded',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },

  // Generation Status
  GENERATION_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed'
  },

  // Cache TTL (in seconds)
  CACHE_TTL: {
    USER: 3600, // 1 hour
    SUBSCRIPTION: 1800, // 30 minutes
    PLANS: 86400, // 24 hours
    GENERATIONS: 600 // 10 minutes
  }
};