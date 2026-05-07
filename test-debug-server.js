const axios = require('axios');

async function testDebugServer() {
  try {
    console.log('Testing debug server...');
    
    const response = await axios.post('http://localhost:3001/api/auth/owner/login', {
      email: 'owner@lifbank.com',
      password: 'owner123'
    });
    
    console.log('✅ Debug server working:', response.status);
    
  } catch (error) {
    console.error('❌ Debug server error:', error.response?.status || error.message);
  }
}

testDebugServer();
