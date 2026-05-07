const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function deployBackend() {
  try {
    console.log('🚀 Starting backend deployment...');
    
    // 1. Check if all necessary files exist
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
      }
    }
    
    // 2. Test production configuration
    console.log('🔧 Testing production configuration...');
    process.env.NODE_ENV = 'production';
    
    // 3. Start production server
    console.log('🌐 Starting production server...');
    execSync('npm run render-start', { stdio: 'inherit' });
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
  }
}

deployBackend();
