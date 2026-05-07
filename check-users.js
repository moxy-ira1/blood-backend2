const { User } = require('./models');

async function checkUsers() {
  try {
    console.log('Checking database users...');
    
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'isActive']
    });
    
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Active: ${user.isActive}`);
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('🔄 Running database seeder...');
      const { execSync } = require('child_process');
      execSync('npm run seed', { stdio: 'inherit' });
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  }
}

checkUsers();
