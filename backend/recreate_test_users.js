const { sequelize } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function recreateTestUsers() {
  try {
    console.log('🔄 Recreating test users with correct passwords...\n');
    
    const testUsers = [
      {
        email: 'admin@ictu.edu.cm',
        password: 'admin123',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin'
      },
      {
        email: 'faculty.coordinator@ictu.edu.cm',
        password: 'coord123',
        firstName: 'Faculty',
        lastName: 'Coordinator',
        role: 'faculty_coordinator'
      },
      {
        email: 'lecturer@ictu.edu.cm',
        password: 'lecturer123',
        firstName: 'John',
        lastName: 'Lecturer',
        role: 'lecturer'
      },
      {
        email: 'hr.staff@ictu.edu.cm',
        password: 'hr123',
        firstName: 'HR',
        lastName: 'Staff',
        role: 'hr_staff'
      },
      {
        email: 'finance.staff@ictu.edu.cm',
        password: 'finance123',
        firstName: 'Finance',
        lastName: 'Staff',
        role: 'finance_staff'
      },
      {
        email: 'student@ictu.edu.cm',
        password: 'student123',
        firstName: 'Test',
        lastName: 'Student',
        role: 'student'
      }
    ];
    
    for (const user of testUsers) {
      console.log(`🔄 Processing ${user.email}...`);
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 12);
      
      // Update or insert user
      const [updatedRows] = await sequelize.query(
        `UPDATE users 
         SET password = :password, 
             first_name = :firstName, 
             last_name = :lastName, 
             is_active = true,
             updated_at = CURRENT_TIMESTAMP
         WHERE email = :email`,
        {
          replacements: {
            email: user.email,
            password: hashedPassword,
            firstName: user.firstName,
            lastName: user.lastName
          },
          type: sequelize.QueryTypes.UPDATE
        }
      );
      
      if (updatedRows > 0) {
        console.log(`✅ Updated ${user.email} with new password`);
      } else {
        // Insert new user if not exists
        await sequelize.query(
          `INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at)
           VALUES (gen_random_uuid(), :email, :password, :firstName, :lastName, :role, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          {
            replacements: {
              email: user.email,
              password: hashedPassword,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role
            },
            type: sequelize.QueryTypes.INSERT
          }
        );
        console.log(`✅ Created new user ${user.email}`);
      }
      
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
        console.log(`   Password verification: ${isValid ? '✅' : '❌'}`);
      }
    }
    
    console.log('\n🎉 All test users recreated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error recreating test users:', error);
    process.exit(1);
  }
}

recreateTestUsers();
