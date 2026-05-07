const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API endpoint...');
    
    const response = await axios.post('http://localhost:3000/api/auth/owner/login', {
      email: 'owner@lifbank.com',
      password: 'owner123'
    });
    
    console.log('✅ API Response:', response.data);
    
  } catch (error) {
    console.error('❌ API Error:', error.response?.status, error.response?.data || error.message);
  }
}

testAPI();
