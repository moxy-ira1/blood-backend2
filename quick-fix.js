const { sequelize } = require('./models');
const seedDatabase = require('./seeders/databaseSeeder');

async function quickFix() {
  try {
    console.log('🚀 Quick database fix...');
    
    // Force sync to create all tables
    await sequelize.sync({ force: true });
    console.log('✅ Tables created');
    
    // Seed data
    await seedDatabase();
    console.log('✅ Data seeded');
    
    // Start server
    require('./server.js');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickFix();
