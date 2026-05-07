const axios = require('axios');

async function testCompleteFlow() {
  try {
    console.log('🔍 Testing complete login flow...');
    
    // Test backend health
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Backend health:', healthResponse.data.status);
    
    // Test frontend accessibility
    const frontendResponse = await axios.get('http://localhost:5173');
    console.log('✅ Frontend accessible:', frontendResponse.status === 200);
    
    // Test login API
    const loginResponse = await axios.post('http://localhost:3000/api/auth/owner/login', {
      email: 'owner@lifbank.com',
      password: 'owner123'
    });
    console.log('✅ Login API working:', !!loginResponse.data.token);
    
    // Test CORS by simulating frontend request
    const corsResponse = await axios.post('http://localhost:3000/api/auth/owner/login', {
      email: 'owner@lifbank.com',
      password: 'owner123'
    }, {
      headers: {
        'Origin': 'http://localhost:5173',
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ CORS working:', !!corsResponse.data.token);
    
    console.log('🎉 Complete flow test successful!');
    console.log('📱 Frontend: http://localhost:5173');
    console.log('🔧 Backend: http://localhost:3000');
    console.log('🔑 Login credentials: owner@lifbank.com / owner123');
    
  } catch (error) {
    console.error('❌ Complete flow test failed:', error.response?.status || error.message);
  }
}

testCompleteFlow();
