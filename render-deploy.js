const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function deployToRender() {
  try {
    console.log('🚀 Preparing for Render deployment...');
    
    // 1. Check all required files
    const requiredFiles = [
      'package.json',
      'server.js',
      'render-init.js',
      '.env.production',
      'Dockerfile'
    ];
    
    console.log('📋 Checking required files...');
    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.log(`❌ ${file} missing`);
        return;
      }
    }
    
    // 2. Update package.json for Render
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
    
    // 3. Create render.yaml for deployment
    const renderYaml = `
services:
  - type: web
    name: blood-bank-backend
    env: node
    plan: free
    buildCommand: 'npm install'
    startCommand: 'npm run render-start'
    envVars:
      - key: NODE_ENV
        value: production
      - key: DB_DIALECT
        value: postgres
      - key: DB_HOST
        value: dpg-d7tj7k9kh4rs73apt39g-a.oregon-postgres.render.com
      - key: DB_USER
        value: blood_postgress_user
      - key: DB_PASSWORD
        value: FCFGQKpBcrfqTkt0uGAG3LZbxvK1m1UL
      - key: DB_NAME
        value: blood_postgress
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
    
    // 4. Test production configuration
    console.log('🔧 Testing production configuration...');
    process.env.NODE_ENV = 'production';
    
    // Test database connection
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    console.log('✅ Production database connection successful');
    
    // Test render-init
    console.log('🔄 Testing render-init...');
    execSync('node render-init.js', { stdio: 'inherit' });
    
    console.log('✅ Backend ready for Render deployment!');
    console.log('📋 Next steps:');
    console.log('1. Push code to GitHub');
    console.log('2. Go to Render Dashboard');
    console.log('3. Connect your GitHub repository');
    console.log('4. Use render.yaml configuration');
    console.log('5. Deploy!');
    
  } catch (error) {
    console.error('❌ Render deployment preparation failed:', error.message);
  }
}

deployToRender();
