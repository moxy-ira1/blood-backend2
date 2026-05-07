const axios = require('axios');

async function debugFlow() {
  try {
    console.log('🔍 Debugging complete flow...');
    
    // Test 1: Backend health
    try {
      const healthResponse = await axios.get('http://localhost:3000/health');
      console.log('✅ Backend health:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Backend health failed:', error.message);
      return;
    }
    
    // Test 2: Frontend accessibility
    try {
      const frontendResponse = await axios.get('http://localhost:5173');
      console.log('✅ Frontend accessible:', frontendResponse.status === 200);
    } catch (error) {
      console.log('❌ Frontend failed:', error.message);
      return;
    }
    
    // Test 3: Login API
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/auth/owner/login', {
        email: 'owner@lifbank.com',
        password: 'owner123'
      });
      console.log('✅ Login API working:', !!loginResponse.data.token);
      console.log('🎉 All components working!');
      console.log('📱 Frontend: http://localhost:5173');
      console.log('🔧 Backend: http://localhost:3000');
      console.log('🔑 Login credentials: owner@lifbank.com / owner123');
    } catch (error) {
      console.log('❌ Login API failed:', error.response?.status || error.message);
      if (error.response?.data) {
        console.log('Error details:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugFlow();
