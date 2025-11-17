const Stripe = require('stripe');
const logger = require('../utils/logger');

if (!process.env.STRIPE_SECRET_KEY) {
  logger.error('STRIPE_SECRET_KEY is not defined');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

logger.info('Stripe initialized successfully');

module.exports = stripe;