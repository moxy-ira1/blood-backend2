const { sequelize } = require('./models');
const seedDatabase = require('./seeders/databaseSeeder');
const bcrypt = require('bcryptjs');

async function quickLoginFix() {
  try {
    console.log('🚀 Quick login fix...');
    
    // Force sync and seed
    await sequelize.sync({ force: true });
    await seedDatabase();
    console.log('✅ Database seeded');
    
    // Test login directly with the same sequelize instance
    const { User } = require('./models');
    const owner = await User.findOne({
      where: { email: 'owner@lifbank.com', role: 'owner', isActive: true }
    });
    
    if (owner) {
      const isValid = await owner.comparePassword('owner123');
      console.log(`✅ Direct login test: ${isValid ? 'SUCCESS' : 'FAILED'}`);
      
      // Test API with same instance
      const authService = require('./services/authService');
      const result = await authService.ownerLogin('owner@lifbank.com', 'owner123', '127.0.0.1', 'test');
      console.log('✅ API test result:', result.success ? 'SUCCESS' : result.error);
      
      if (result.success) {
        console.log('🎉 Login is working! Starting server...');
        require('./server.js');
      }
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

quickLoginFix();
