const { sequelize } = require('./backend/src/config/database');
const bcrypt = require('bcryptjs');

async function verifyCredentials() {
  try {
    console.log('🔍 Verifying database connection and credentials...\n');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // Check if test user exists
    console.log('🔍 Checking test credentials...\n');

    const testUser = await sequelize.query(
      'SELECT id, email, password, first_name, last_name, role FROM users WHERE email = $1',
      { bind: ['test@example.com'] }
    );

    if (testUser[0].length === 0) {
      console.log('❌ Test user "test@example.com" not found in database\n');

      // Create test user
      console.log('🔧 Creating test user...\n');

      const testPasswordHash = await bcrypt.hash('password123', 12);
      await sequelize.query(
        'INSERT INTO users (email, password, first_name, last_name, role, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())',
        { bind: ['test@example.com', testPasswordHash, 'Test', 'User', 'admin'] }
      );

      console.log('✅ Test user created successfully');
      console.log('📧 Email: test@example.com');
      console.log('🔑 Password: password123\n');
    } else {
      console.log('✅ Test user exists:\n');
      const user = testUser[0][0];
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Name: ${user.first_name} ${user.last_name}`);
      console.log(`🚀 Role: ${user.role}`);
      console.log(`🔑 Password exists: ${!!user.password ? 'Yes' : 'No'}`);

      // Test password verification
      const isValidPassword = await bcrypt.compare('password123', user.password);
      console.log(`✅ Password verification: ${isValidPassword ? 'SUCCESS' : 'FAILED'}\n`);
    }

    // Check all users for reference
    console.log('📋 All users in system:\n');

    const allUsers = await sequelize.query(
      'SELECT email, first_name, last_name, role FROM users ORDER BY email LIMIT 10',
      { type: sequelize.QueryTypes.SELECT }
    );

    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.first_name} ${user.last_name} [${user.role}]`);
    });

    console.log('\n🎯 RECOMMENDED LOGIN CREDENTIALS:');
    console.log('═══════════════════════════════════════');
    console.log('Admin Login:');
    console.log('📧 test@example.com');
    console.log('🔑 password123');
    console.log('═══════════════════════════════════════');
    console.log('Academic Staff:');
    console.log('📧 ict.coordinator@ictu.edu.cm');
    console.log('🔑 password123');
    console.log('═══════════════════════════════════════');
    console.log('Student:');
    console.log('📧 student.james@ictu.edu.cm');
    console.log('🔑 password123');

  } catch (error) {
    console.error('\n❌ Error verifying credentials:');
    console.error('Error details:', error.message);

    if (error.message.includes('connect ECONNREFUSED') ||
        error.message.includes('connection refused')) {
      console.log('\n💡 TIP: Make sure PostgreSQL is running!');
      console.log('💡 TIP: Check your database configuration in backend/.env');
    } else if (error.message.includes('does not exist')) {
      console.log('\n💡 TIP: Run database migrations first!');
      console.log('💡 TIP: cd backend && npm run migrate && npm run seed');
    }
  } finally {
    await sequelize.close();
    console.log('\n🔚 Database connection closed');
  }
}

// Run verification if called directly
if (require.main === module) {
  verifyCredentials();
}
