const { sequelize } = require('./models');
const seedDatabase = require('./seeders/databaseSeeder');

async function fixDeployedDatabase() {
  try {
    console.log('🔧 Fixing deployed database...');
    
    // Clear and recreate database
    await sequelize.sync({ force: true });
    console.log('✅ Database cleared and recreated');
    
    // Seed database
    await seedDatabase();
    console.log('✅ Database seeded successfully');
    
    // Verify users exist
    const { User } = require('./models');
    const userCount = await User.count();
    console.log(`✅ ${userCount} users created`);
    
    // Test login
    const owner = await User.findOne({
      where: { email: 'owner@lifbank.com', role: 'owner', isActive: true }
    });
    
    if (owner) {
      const isValid = await owner.comparePassword('owner123');
      console.log(`✅ Login test: ${isValid ? 'SUCCESS' : 'FAILED'}`);
    }
    
    console.log('✅ Database fix completed!');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
  }
}

fixDeployedDatabase();
