const { sequelize } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function verifyCredentials() {
  try {
    console.log('🔍 Verifying user credentials in database...\n');
    
    // Test users to verify
    const testUsers = [
      { email: 'admin@ictu.edu.cm', password: 'admin123' },
      { email: 'faculty.coordinator@ictu.edu.cm', password: 'coord123' },
      { email: 'lecturer@ictu.edu.cm', password: 'lecturer123' },
      { email: 'hr.staff@ictu.edu.cm', password: 'hr123' },
      { email: 'finance.staff@ictu.edu.cm', password: 'finance123' },
      { email: 'student@ictu.edu.cm', password: 'student123' }
    ];
    
    for (const testUser of testUsers) {
      console.log(`\n🔐 Checking ${testUser.email}:`);
      
      // Query user from database
      const users = await sequelize.query(
        'SELECT id, email, password, first_name, last_name, role, is_active FROM users WHERE email = :email',
        {
          replacements: { email: testUser.email },
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      if (!users || users.length === 0) {
        console.log(`❌ User not found in database`);
        continue;
      }
      
      const user = users[0];
      console.log(`✅ User found: ${user.first_name} ${user.last_name} (${user.role})`);
      console.log(`   Active: ${user.is_active}`);
      
      // Verify password
      const isValidPassword = await bcrypt.compare(testUser.password, user.password);
      console.log(`   Password match: ${isValidPassword ? '✅' : '❌'}`);
      
      if (!isValidPassword) {
        console.log(`   Stored hash: ${user.password.substring(0, 20)}...`);
        console.log(`   Test password: ${testUser.password}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error verifying credentials:', error);
    process.exit(1);
  }
}

verifyCredentials();
