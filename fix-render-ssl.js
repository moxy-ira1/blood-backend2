const { sequelize } = require('./models');

async function testRenderConnection() {
  try {
    console.log('🔧 Testing Render PostgreSQL connection...');
    
    // Set production environment
    process.env.NODE_ENV = 'production';
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test database sync
    await sequelize.sync({ force: false });
    console.log('✅ Database sync successful');
    
    console.log('🎉 Render connection is working!');
    
  } catch (error) {
    console.error('❌ Render connection failed:', error.message);
    
    // Try with alternative SSL settings
    console.log('🔄 Trying alternative SSL settings...');
    
    // Update database config for Render
    const config = require('./config/database');
    config.production.ssl = false;
    config.production.dialectOptions.ssl = false;
    
    try {
      await sequelize.authenticate();
      console.log('✅ Alternative connection successful');
    } catch (error2) {
      console.error('❌ Alternative connection also failed:', error2.message);
    }
  }
}

testRenderConnection();
