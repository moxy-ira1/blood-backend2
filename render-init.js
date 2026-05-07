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
      console.log('No users found. Running database seeder...');
      await seedDatabase();
      console.log('Database seeded successfully!');
    } else {
      console.log(`Database already initialized with ${userCount} users.`);
    }
    
    console.log('Database initialization completed.');
    process.exit(0);
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Only run initialization in production
if (process.env.NODE_ENV === 'production') {
  initDatabase();
} else {
  console.log('Skipping database initialization (not in production mode)');
  process.exit(0);
}
