const { sequelize } = require('./models');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Force sync to create all tables
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created successfully');
    
    // Test if user table exists
    const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    
    if (results.length > 0) {
      console.log('✅ Users table exists');
    } else {
      console.log('❌ Users table not found');
    }
    
    await sequelize.close();
    console.log('✅ Database initialization completed');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
