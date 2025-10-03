const { sequelize } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function updateTestPasswords() {
  try {
    console.log('🔄 Updating test user passwords...\n');
    
    const testUsers = [
      { email: 'admin@ictu.edu.cm', password: 'admin123' },
      { email: 'faculty.coordinator@ictu.edu.cm', password: 'coord123' },
      { email: 'lecturer@ictu.edu.cm', password: 'lecturer123' },
      { email: 'hr.staff@ictu.edu.cm', password: 'hr123' },
      { email: 'finance.staff@ictu.edu.cm', password: 'finance123' },
      { email: 'student@ictu.edu.cm', password: 'student123' }
    ];
    
    for (const user of testUsers) {
      console.log(`🔄 Updating password for ${user.email}...`);
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 12);
      
      // Update user password
      await sequelize.query(
        `UPDATE users 
         SET password = :password, 
             updated_at = CURRENT_TIMESTAMP
         WHERE email = :email`,
        {
          replacements: {
            email: user.email,
            password: hashedPassword
          },
          type: sequelize.QueryTypes.UPDATE
        }
      );
      
      // Verify the password works
      const verifyUser = await sequelize.query(
        'SELECT password FROM users WHERE email = :email',
        {
          replacements: { email: user.email },
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      if (verifyUser.length > 0) {
        const isValid = await bcrypt.compare(user.password, verifyUser[0].password);
        console.log(`✅ ${user.email} - Password verification: ${isValid ? '✅' : '❌'}`);
      }
    }
    
    console.log('\n🎉 All test user passwords updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating test passwords:', error);
    process.exit(1);
  }
}

updateTestPasswords();
