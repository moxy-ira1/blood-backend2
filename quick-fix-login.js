const { sequelize } = require('./models');
const seedDatabase = require('./seeders/databaseSeeder');

async function quickFixLogin() {
  try {
    console.log('🔧 Quick fix for login issue...');
    
    // Clear and recreate database
    await sequelize.sync({ force: true });
    console.log('✅ Database cleared');
    
    // Seed database
    await seedDatabase();
    console.log('✅ Database seeded');
    
    // Test login immediately
    const { User } = require('./models');
    const owner = await User.findOne({
      where: { email: 'owner@lifbank.com', role: 'owner', isActive: true }
    });
    
    if (owner) {
      const isValid = await owner.comparePassword('owner123');
      console.log(`✅ Login test: ${isValid ? 'SUCCESS' : 'FAILED'}`);
      
      if (isValid) {
        console.log('🎉 Login is now working!');
        console.log('📱 Frontend: http://localhost:5173');
        console.log('🔧 Backend: http://localhost:3000');
        console.log('🔑 Login credentials: owner@lifbank.com / owner123');
      }
    }
    
  } catch (error) {
    console.error('❌ Quick fix failed:', error.message);
  }
}

quickFixLogin();
