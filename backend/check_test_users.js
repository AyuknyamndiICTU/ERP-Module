const { sequelize } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function checkTestUsers() {
  try {
    console.log('🔍 Checking test users in database...');
    
    const testUsers = [
      'admin@ictu.edu.cm',
      'faculty.coordinator@ictu.edu.cm', 
      'lecturer@ictu.edu.cm',
      'hr.staff@ictu.edu.cm',
      'finance.staff@ictu.edu.cm',
      'student@ictu.edu.cm'
    ];
    
    for (const email of testUsers) {
      const users = await sequelize.query(
        'SELECT id, email, role, is_active, password FROM users WHERE email = :email',
        {
          replacements: { email },
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      if (users.length > 0) {
        const user = users[0];
        console.log(`✅ Found user: ${email}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Active: ${user.is_active}`);
        console.log(`   - Has Password: ${user.password ? 'Yes' : 'No'}`);
        
        // Test password verification
        if (user.password) {
          const isValidPassword = await bcrypt.compare('password123', user.password);
          console.log(`   - Password 'password123' valid: ${isValidPassword}`);
        }
      } else {
        console.log(`❌ User not found: ${email}`);
      }
      console.log('');
    }
    
    // Check total user count
    const totalUsers = await sequelize.query(
      'SELECT COUNT(*) as count FROM users',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`📊 Total users in database: ${totalUsers[0].count}`);
    
  } catch (error) {
    console.error('❌ Error checking test users:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTestUsers();
