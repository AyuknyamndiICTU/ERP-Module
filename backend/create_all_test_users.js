const { sequelize } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function createAllTestUsers() {
  try {
    console.log('👥 Creating all test users...');
    
    const testUsers = [
      {
        email: 'admin@ictu.edu.cm',
        password: 'password123',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin'
      },
      {
        email: 'faculty.coordinator@ictu.edu.cm',
        password: 'password123',
        firstName: 'Faculty',
        lastName: 'Coordinator',
        role: 'faculty_coordinator'
      },
      {
        email: 'lecturer@ictu.edu.cm',
        password: 'password123',
        firstName: 'John',
        lastName: 'Lecturer',
        role: 'lecturer'
      },
      {
        email: 'hr.staff@ictu.edu.cm',
        password: 'password123',
        firstName: 'HR',
        lastName: 'Staff',
        role: 'hr_staff'
      },
      {
        email: 'finance.staff@ictu.edu.cm',
        password: 'password123',
        firstName: 'Finance',
        lastName: 'Staff',
        role: 'finance_staff'
      },
      {
        email: 'student@ictu.edu.cm',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Student',
        role: 'student'
      }
    ];
    
    for (const userData of testUsers) {
      // Check if user already exists
      const existingUsers = await sequelize.query(
        'SELECT id FROM users WHERE email = :email',
        {
          replacements: { email: userData.email },
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      if (existingUsers.length > 0) {
        console.log(`⚠️ User already exists: ${userData.email}`);
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Create user
      await sequelize.query(`
        INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at)
        VALUES (gen_random_uuid(), :email, :password, :firstName, :lastName, :role, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, {
        replacements: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role
        }
      });
      
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }
    
    // Verify all users were created
    const totalUsers = await sequelize.query(
      'SELECT COUNT(*) as count FROM users',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`📊 Total users in database: ${totalUsers[0].count}`);
    console.log('🎉 All test users created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  } finally {
    await sequelize.close();
  }
}

createAllTestUsers();
