const Replicate = require('replicate');
const logger = require('../utils/logger');

if (!process.env.REPLICATE_API_TOKEN) {
  logger.error('REPLICATE_API_TOKEN is not defined');
  process.exit(1);
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

module.exports = replicate;