const { sequelize } = require('./models');
const seedDatabase = require('./seeders/databaseSeeder');

async function startWithSeed() {
  try {
    console.log('🚀 Starting server with seeded database...');
    
    // Ensure database is properly synced
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');
    
    // Check if users exist, if not seed
    const { User } = require('./models');
    const userCount = await User.count();
    
    if (userCount === 0) {
      console.log('🔄 No users found, seeding database...');
      await seedDatabase();
      console.log('✅ Database seeded successfully');
    } else {
      console.log(`✅ Database already has ${userCount} users`);
    }
    
    // Start the server
    console.log('🌐 Starting web server...');
    require('./server.js');
    
  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    process.exit(1);
  }
}

startWithSeed();
