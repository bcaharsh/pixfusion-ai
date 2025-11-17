const Plan = require('../../models/Plan.model');
const logger = require('../../utils/logger');

const planSeeder = async () => {
  try {
    // Check if plans already exist
    const existingPlans = await Plan.countDocuments();
    
    if (existingPlans > 0) {
      logger.info('Plans already exist, skipping seeding');
      console.log('ℹ️  Plans already exist in database');
      return;
    }

    const plans = [
      {
        name: 'free',
        displayName: 'Free',
        description: 'Perfect for trying out our service',
        price: 0,
        currency: 'USD',
        billingCycle: 'monthly',
        credits: 3,
        imageLimit: 3,
        features: [
          '3 image generations per month',
          'Basic quality',
          'Standard support',
          'Watermarked images',
          'Public gallery access'
        ],
        isActive: true,
        stripePriceId: null,
        priority: 1
      },
      {
        name: 'starter',
        displayName: 'Starter',
        description: 'Great for personal projects',
        price: 9.99,
        currency: 'USD',
        billingCycle: 'monthly',
        credits: 50,
        imageLimit: 50,
        features: [
          '50 image generations per month',
          'High quality',
          'Priority support',
          'No watermark',
          'Commercial use',
          'Private generations',
          'Download in HD'
        ],
        isActive: true,
        stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || null,
        priority: 2
      },
      {
        name: 'pro',
        displayName: 'Pro',
        description: 'For professionals and creators',
        price: 24.99,
        currency: 'USD',
        billingCycle: 'monthly',
        credits: 150,
        imageLimit: 150,
        features: [
          '150 image generations per month',
          'Ultra high quality',
          'Priority support',
          'No watermark',
          'Commercial use',
          'Private generations',
          'Download in 4K',
          'Advanced AI models',
          'Batch processing',
          'API access'
        ],
        isActive: true,
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID || null,
        priority: 3
      },
      {
        name: 'enterprise',
        displayName: 'Enterprise',
        description: 'For teams and businesses',
        price: 99.99,
        currency: 'USD',
        billingCycle: 'monthly',
        credits: 1000,
        imageLimit: 1000,
        features: [
          '1000 image generations per month',
          'Ultra high quality',
          '24/7 dedicated support',
          'No watermark',
          'Commercial use',
          'Private generations',
          'Download in 8K',
          'All AI models',
          'Batch processing',
          'Full API access',
          'Custom branding',
          'Team collaboration',
          'Usage analytics',
          'SLA guarantee'
        ],
        isActive: true,
        stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || null,
        priority: 4
      },
      {
        name: 'starter-annual',
        displayName: 'Starter Annual',
        description: 'Great for personal projects - Save 20%',
        price: 95.99,
        currency: 'USD',
        billingCycle: 'yearly',
        credits: 50,
        imageLimit: 50,
        features: [
          '50 image generations per month',
          'High quality',
          'Priority support',
          'No watermark',
          'Commercial use',
          'Private generations',
          'Download in HD',
          'Save 20% annually'
        ],
        isActive: true,
        stripePriceId: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID || null,
        priority: 5
      },
      {
        name: 'pro-annual',
        displayName: 'Pro Annual',
        description: 'For professionals - Save 20%',
        price: 239.99,
        currency: 'USD',
        billingCycle: 'yearly',
        credits: 150,
        imageLimit: 150,
        features: [
          '150 image generations per month',
          'Ultra high quality',
          'Priority support',
          'No watermark',
          'Commercial use',
          'Private generations',
          'Download in 4K',
          'Advanced AI models',
          'Batch processing',
          'API access',
          'Save 20% annually'
        ],
        isActive: true,
        stripePriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || null,
        priority: 6
      }
    ];

    await Plan.insertMany(plans);
    logger.info(`Successfully seeded ${plans.length} subscription plans`);
    console.log(`✅ Successfully seeded ${plans.length} plans`);

  } catch (error) {
    logger.error('Error seeding plans:', error);
    throw error;
  }
};

module.exports = planSeeder;