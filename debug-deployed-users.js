const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function debugDeployedUsers() {
  try {
    console.log('🔍 Debugging deployed backend users...');
    
    // Check if users exist
    const userCount = await User.count();
    console.log(`Users in database: ${userCount}`);
    
    if (userCount > 0) {
      // Get owner user
      const owner = await User.findOne({
        where: { email: 'owner@lifbank.com', role: 'owner', isActive: true }
      });
      
      if (owner) {
        console.log('✅ Owner user found:', {
          email: owner.email,
          role: owner.role,
          isActive: owner.isActive,
          hasPassword: !!owner.password
        });
        
        // Test password
        const isValid = await owner.comparePassword('owner123');
        console.log('Password test:', isValid ? '✅ SUCCESS' : '❌ FAILED');
        
        if (!isValid) {
          console.log('🔧 Fixing password...');
          owner.password = 'owner123';
          await owner.save();
          console.log('✅ Password fixed');
          
          // Test again
          const testAgain = await owner.comparePassword('owner123');
          console.log('Password test after fix:', testAgain ? '✅ SUCCESS' : '❌ FAILED');
        }
      } else {
        console.log('❌ Owner user not found');
      }
    } else {
      console.log('❌ No users found - database not seeded properly');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugDeployedUsers();
