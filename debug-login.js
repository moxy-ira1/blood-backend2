const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function debugLogin() {
  try {
    console.log('🔍 Debugging login process...');
    
    // Find user
    const user = await User.findOne({
      where: { email: 'owner@lifbank.com', role: 'owner', isActive: true }
    });
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      hasPassword: !!user.password
    });
    
    // Test password comparison
    const testPassword = 'owner123';
    console.log('🔐 Testing password comparison...');
    console.log('Input password:', testPassword);
    console.log('Stored password hash:', user.password);
    
    const isValid = await user.comparePassword(testPassword);
    console.log('Password comparison result:', isValid);
    
    // Manual bcrypt comparison
    const manualCompare = await bcrypt.compare(testPassword, user.password);
    console.log('Manual bcrypt comparison:', manualCompare);
    
    if (isValid) {
      console.log('✅ Login would succeed!');
    } else {
      console.log('❌ Login would fail - password mismatch');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugLogin();
