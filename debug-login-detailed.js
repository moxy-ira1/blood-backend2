const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function debugLogin() {
  try {
    console.log('🔍 Detailed login debug...');
    
    // Find the owner user
    const owner = await User.findOne({
      where: { email: 'owner@lifbank.com', role: 'owner', isActive: true }
    });
    
    if (!owner) {
      console.log('❌ Owner user not found');
      return;
    }
    
    console.log('✅ Owner user found:', {
      id: owner.id,
      email: owner.email,
      role: owner.role,
      isActive: owner.isActive,
      hasPassword: !!owner.password,
      passwordLength: owner.password?.length
    });
    
    // Test password comparison
    const testPassword = 'owner123';
    console.log('🔐 Testing password comparison...');
    console.log('Input password:', testPassword);
    
    // Test the comparePassword method
    const isValid = await owner.comparePassword(testPassword);
    console.log('Password comparison result:', isValid);
    
    // Manual bcrypt comparison
    const manualCompare = await bcrypt.compare(testPassword, owner.password);
    console.log('Manual bcrypt comparison:', manualCompare);
    
    // Test with wrong password
    const wrongPassword = 'wrong123';
    const wrongCompare = await owner.comparePassword(wrongPassword);
    console.log('Wrong password comparison:', wrongCompare);
    
    if (isValid) {
      console.log('✅ Login should work!');
    } else {
      console.log('❌ Password comparison failed');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugLogin();
