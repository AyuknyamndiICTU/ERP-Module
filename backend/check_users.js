const { sequelize } = require('./src/config/database');

async function checkUsers() {
  try {
    console.log('📧 Checking actual user emails in database...\n');
    
    const users = await sequelize.query(
      'SELECT email, role, is_active FROM users ORDER BY role, email',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('Current users in database:');
    console.log('='.repeat(50));
    
    users.forEach(user => {
      const status = user.is_active ? '✅' : '❌';
      console.log(`${status} ${user.email} (${user.role})`);
    });
    
    console.log(`\nTotal users: ${users.length}`);
    
    // Show test user credentials that should be used
    console.log('\n🔑 Correct test user credentials:');
    console.log('='.repeat(50));
    
    const testUsers = users.filter(user => 
      ['admin', 'faculty_coordinator', 'lecturer', 'hr_staff', 'finance_staff', 'student'].includes(user.role)
    );
    
    testUsers.forEach(user => {
      let password = 'admin123'; // default
      if (user.role === 'faculty_coordinator') password = 'coord123';
      else if (user.role === 'lecturer') password = 'lecturer123';
      else if (user.role === 'hr_staff') password = 'hr123';
      else if (user.role === 'finance_staff') password = 'finance123';
      else if (user.role === 'student') password = 'student123';
      
      console.log(`${user.role}: ${user.email} / ${password}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking user emails:', error);
    process.exit(1);
  }
}

checkUsers();
