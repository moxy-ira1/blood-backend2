const { sequelize } = require('./models');
const seedDatabase = require('./seeders/databaseSeeder');

async function initDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync database (create tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully.');
    
    // Check if users already exist
    const { User } = require('./models');
    const userCount = await User.count();
    
    if (userCount === 0) {
      console.log('No users found, seeding database...');
      await seedDatabase();
      console.log('Database seeding completed successfully!');
    } else {
      console.log(`${userCount} users already exist, skipping seeding.`);
    }
    
    console.log('Database initialization completed successfully!');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Only run if this file is called directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
