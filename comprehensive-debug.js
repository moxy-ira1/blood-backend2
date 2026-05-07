const { sequelize } = require('./models');
const bcrypt = require('bcryptjs');

async function comprehensiveDebug() {
  try {
    console.log('🔍 Comprehensive database debug...');
    
    // 1. Test database connection
    console.log('\n1. Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // 2. Check if tables exist
    console.log('\n2. Checking database tables...');
    const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables found:', results.map(r => r.name));
    
    // 3. Check if users table exists and has data
    console.log('\n3. Checking users table...');
    const [userResults] = await sequelize.query("SELECT COUNT(*) as count FROM users");
    console.log('Users in database:', userResults[0].count);
    
    // 4. Get all users
    console.log('\n4. Getting all users...');
    const [allUsers] = await sequelize.query("SELECT id, email, role, isActive FROM users");
    console.log('All users:', allUsers);
    
    // 5. Test specific user
    console.log('\n5. Testing owner user...');
    const { User } = require('./models');
    const owner = await User.findOne({
      where: { email: 'owner@lifbank.com', role: 'owner', isActive: true }
    });
    
    if (owner) {
      console.log('✅ Owner user found:', {
        id: owner.id,
        email: owner.email,
        role: owner.role,
        isActive: owner.isActive,
        hasPassword: !!owner.password
      });
      
      // Test password comparison
      const testPassword = 'owner123';
      console.log('🔐 Testing password comparison...');
      console.log('Input password:', testPassword);
      console.log('Stored password hash length:', owner.password.length);
      
      const isValid = await owner.comparePassword(testPassword);
      console.log('Password comparison result:', isValid);
      
      // Manual bcrypt comparison
      const manualCompare = await bcrypt.compare(testPassword, owner.password);
      console.log('Manual bcrypt comparison:', manualCompare);
      
    } else {
      console.log('❌ Owner user not found');
    }
    
    await sequelize.close();
    console.log('\n✅ Debug completed');
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    console.error('Full error:', error);
  }
}

comprehensiveDebug();
