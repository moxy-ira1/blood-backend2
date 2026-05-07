const { sequelize } = require('./models');
const seedDatabase = require('./seeders/databaseSeeder');

async function runSeeder() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync database (this will create tables if they don't exist)
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully.');

    // Run the seeder
    await seedDatabase();

    console.log('\nSeeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running seeder:', error);
    process.exit(1);
  }
}

runSeeder();
