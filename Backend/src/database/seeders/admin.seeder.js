const Admin = require('../../models/Admin.model');
const logger = require('../../utils/logger');

const adminSeeder = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@image9.com' });
    
    if (existingAdmin) {
      logger.info('Admin user already exists');
      console.log('ℹ️  Admin user already exists');
      return;
    }

    // Create default admin
    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@image9.com',
      password: 'Admin@123456',  // Will be hashed by pre-save hook
      role: 'superadmin',  // ✅ Matches the model enum
      permissions: ['all'],  // ✅ Now allowed in the model
      isActive: true
    });

    logger.info('Admin user created successfully');
    console.log('✅ Admin user created successfully!');
    console.log('\n📧 Admin Credentials:');
    console.log('   Email: admin@image9.com');
    console.log('   Password: Admin@123456');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');

  } catch (error) {
    logger.error('Error seeding admin:', error);
    throw error;
  }
};

module.exports = adminSeeder;