const fs = require('fs');
const path = require('path');

async function prepareRenderFiles() {
  try {
    console.log('🚀 Preparing Render deployment files...');
    
    // 1. Update package.json for Render
    console.log('📦 Updating package.json for Render...');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Ensure render-start script exists
    if (!packageJson.scripts['render-start']) {
      packageJson.scripts['render-start'] = 'node render-init.js && node server.js';
    }
    
    // Add engines for Render
    packageJson.engines = {
      node: '18.x',
      npm: '9.x'
    };
    
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json updated for Render');
    
    // 2. Create render.yaml for deployment
    const renderYaml = `services:
  - type: web
    name: blood-bank-backend
    env: node
    plan: free
    buildCommand: 'npm install'
    startCommand: 'npm run render-start'
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: postgres://blood_postgress_user:FCFGQKpBcrfqTkt0uGAG3LZbxvK1m1UL@dpg-d7tj7k9kh4rs73apt39g-a.oregon-postgres.render.com/blood_postgress
      - key: JWT_SECRET
        value: blood-bank-super-secure-jwt-secret-key-for-production-2024
      - key: JWT_EXPIRES_IN
        value: 7d
    autoDeploy: yes
`;
    
    fs.writeFileSync('render.yaml', renderYaml);
    console.log('✅ render.yaml created');
    
    // 3. Create .env file for Render (will be overridden by render.yaml)
    const envContent = `NODE_ENV=production
DATABASE_URL=postgres://blood_postgress_user:FCFGQKpBcrfqTkt0uGAG3LZbxvK1m1UL@dpg-d7tj7k9kh4rs73apt39g-a.oregon-postgres.render.com/blood_postgress
JWT_SECRET=blood-bank-super-secure-jwt-secret-key-for-production-2024
JWT_EXPIRES_IN=7d
`;
    
    fs.writeFileSync('.env', envContent);
    console.log('✅ .env file created for Render');
    
    // 4. Update render-init.js to work with DATABASE_URL
    const renderInitContent = `const { sequelize } = require('./models');
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
      console.log(\`\${userCount} users already exist, skipping seeding.\`);
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
`;
    
    fs.writeFileSync('render-init.js', renderInitContent);
    console.log('✅ render-init.js updated for Render');
    
    console.log('🎉 Render deployment files prepared successfully!');
    console.log('📋 Files created/updated:');
    console.log('  - package.json (with engines and render-start script)');
    console.log('  - render.yaml (deployment configuration)');
    console.log('  - .env (environment variables)');
    console.log('  - render-init.js (database initialization)');
    console.log('');
    console.log('🚀 Next steps for Render deployment:');
    console.log('1. Push your code to GitHub');
    console.log('2. Go to Render Dashboard (https://render.com)');
    console.log('3. Click "New" → "Web Service"');
    console.log('4. Connect your GitHub repository');
    console.log('5. Render will automatically detect render.yaml');
    console.log('6. Click "Create Web Service"');
    console.log('7. Wait for deployment to complete');
    console.log('');
    console.log('📊 Your deployed backend will be available at:');
    console.log('https://blood-bank-backend.onrender.com');
    
  } catch (error) {
    console.error('❌ Error preparing Render files:', error.message);
  }
}

prepareRenderFiles();
