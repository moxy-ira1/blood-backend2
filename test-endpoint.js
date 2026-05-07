const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('Testing /api/auth/owner/login endpoint...');
    
    const response = await axios.post('http://localhost:3000/api/auth/owner/login', {
      email: 'owner@lifbank.com',
      password: 'owner123'
    });
    
    console.log('✅ Endpoint accessible:', response.status);
    console.log('✅ Response received:', !!response.data);
    
  } catch (error) {
    console.error('❌ Endpoint error:', error.response?.status || error.message);
    if (error.response?.status === 404) {
      console.log('❌ Route not found - checking server routes...');
    }
  }
}

testEndpoint();
