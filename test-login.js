const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing owner login...');
    
    const response = await axios.post('http://localhost:3000/api/auth/owner/login', {
      email: 'owner@lifbank.com',
      password: 'owner123'
    });
    
    console.log('✅ Login successful!');
    console.log('Response:', response.data);
    
    if (response.data.token && response.data.user) {
      console.log('✅ Token received:', response.data.token.substring(0, 20) + '...');
      console.log('✅ User data:', response.data.user);
    }
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
}

testLogin();
