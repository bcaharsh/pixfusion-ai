// ⚠️ IMPORTANT: This line MUST be at the very top!
require('dotenv').config();

const mongoose = require('mongoose');
const adminSeeder = require('./admin.seeder');
const planSeeder = require('./plan.seeder');
const logger = require('../../utils/logger');
const connectDB = require('../../config/database');

const seedDatabase = async () => {
  try {
    // Debug: Check if environment variable is loaded
    console.log('🔍 Checking environment variables...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Loaded' : '❌ NOT FOUND');
    
    if (!process.env.MONGODB_URI) {
      console.error('\n❌ ERROR: MONGODB_URI is not defined!');
      console.error('Please ensure:');
      console.error('1. .env file exists in project root');
      console.error('2. MONGODB_URI is defined in .env file');
      console.error('3. No syntax errors in .env file\n');
      process.exit(1);
    }

    // Connect to database
    console.log('\n📡 Connecting to MongoDB...');
    await connectDB();
    logger.info('Connected to database for seeding');
    console.log('✅ MongoDB Connected!\n');

    // Run seeders
    console.log('📦 Seeding plans...');
    await planSeeder();
    console.log('✅ Plans seeded successfully!\n');

    console.log('👤 Seeding admin user...');
    await adminSeeder();
    console.log('✅ Admin user seeded successfully!\n');

    logger.info('✓ Database seeding completed successfully');
    
    console.log('╔════════════════════════════════════════╗');
    console.log('║     ✅ SEEDING COMPLETED SUCCESSFULLY  ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('\n📧 Admin Login:');
    console.log('   Email: admin@image9.com');
    console.log('   Password: Admin@123456');
    console.log('\n⚠️  Change password after first login!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ SEEDING FAILED!\n');
    logger.error('Error seeding database:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;