const { sequelize } = require('./models');
const seedDatabase = require('./seeders/databaseSeeder');

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database synchronization...');
    
    // Force sync to recreate all tables
    await sequelize.sync({ force: true });
    console.log('✅ Database tables recreated');
    
    // Clear any existing data
    await sequelize.query('DELETE FROM users');
    await sequelize.query('DELETE FROM btds');
    await sequelize.query('DELETE FROM workers');
    await sequelize.query('DELETE FROM donors');
    console.log('✅ Existing data cleared');
    
    // Seed with fresh data
    await seedDatabase();
    console.log('✅ Database seeded successfully');
    
    // Verify data was inserted
    const { User } = require('./models');
    const userCount = await User.count();
    console.log(`✅ ${userCount} users created in database`);
    
    // Test login directly
    const owner = await User.findOne({
      where: { email: 'owner@lifbank.com', role: 'owner', isActive: true }
    });
    
    if (owner) {
      const isValid = await owner.comparePassword('owner123');
      console.log(`✅ Owner login test: ${isValid ? 'SUCCESS' : 'FAILED'}`);
    }
    
    console.log('✅ Database fix completed!');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
  }
}

fixDatabase();
