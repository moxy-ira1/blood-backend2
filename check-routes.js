const express = require('express');
const cors = require('cors');

// Create a test app to check routes
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());

// Load the auth routes
app.use('/api/auth', require('./routes/auth'));

// Add route logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Test all possible endpoints
async function testRoutes() {
  try {
    console.log('🔍 Testing all auth routes...');
    
    const axios = require('axios');
    
    // Test owner login
    try {
      const response = await axios.post('http://localhost:3000/api/auth/owner/login', {
        email: 'owner@lifbank.com',
        password: 'owner123'
      });
      console.log('✅ /api/auth/owner/login - SUCCESS');
    } catch (error) {
      console.log('❌ /api/auth/owner/login -', error.response?.status || error.message);
    }
    
    // Test worker login
    try {
      const response = await axios.post('http://localhost:3000/api/auth/worker/login', {
        phone: '+1234567891',
        otp: '123456'
      });
      console.log('✅ /api/auth/worker/login - SUCCESS');
    } catch (error) {
      console.log('❌ /api/auth/worker/login -', error.response?.status || error.message);
    }
    
    // Test donor login
    try {
      const response = await axios.post('http://localhost:3000/api/auth/donor/login', {
        email: 'donor1@lifbank.com',
        password: 'donor123'
      });
      console.log('✅ /api/auth/donor/login - SUCCESS');
    } catch (error) {
      console.log('❌ /api/auth/donor/login -', error.response?.status || error.message);
    }
    
  } catch (error) {
    console.error('❌ Route test failed:', error.message);
  }
}

testRoutes();
