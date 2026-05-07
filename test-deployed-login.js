const axios = require('axios');

async function testDeployedLogin() {
  try {
    console.log('🔍 Testing deployed backend login...');
    
    // Test owner login
    const response = await axios.post('http://localhost:3000/api/auth/owner/login', {
      email: 'owner@lifbank.com',
      password: 'owner123'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', response.data.token.substring(0, 20) + '...');
    console.log('User:', response.data.user.email, '-', response.data.user.role);
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.status, error.response?.data || error.message);
  }
}

testDeployedLogin();
