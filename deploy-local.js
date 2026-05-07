const { sequelize } = require('./models');
const seedDatabase = require('./seeders/databaseSeeder');

async function deployLocal() {
  try {
    console.log('🚀 Deploying backend locally...');
    
    // Set environment to production but use SQLite
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'blood-bank-jwt-secret-key-for-production';
    
    // Force sync and seed database
    await sequelize.sync({ force: true });
    console.log('✅ Database synchronized');
    
    await seedDatabase();
    console.log('✅ Database seeded');
    
    // Start server
    console.log('🌐 Starting production server...');
    require('./server.js');
    
  } catch (error) {
    console.error('❌ Local deployment failed:', error.message);
  }
}

deployLocal();
