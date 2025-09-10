const { sequelize } = require('./src/config/database');

const checkUsers = async () => {
  try {
    console.log('🔍 Checking database connection...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Check users table
    console.log('\n🔍 Checking users in database...');

    const users = await sequelize.query(
      'SELECT id, email, first_name, last_name, role, is_active FROM users ORDER BY email LIMIT 20',
      { type: sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    console.log('📋 Users found:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.first_name} ${user.last_name}) - ${user.role}`);
    });

    // Check specific user for debugging
    console.log('\n🔍 Checking specific user credentials...');
    const specificUser = await sequelize.query(
      'SELECT email, password FROM users WHERE email = \'ict.coordinator@ictu.edu.cm\'',
      { type: sequelize.QueryTypes.SELECT }
    );

    if (specificUser.length > 0) {
      console.log('User found:', specificUser[0].email);
      console.log('Password hash exists:', !!specificUser[0].password);

      // Test password verification
      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare('password123', specificUser[0].password);
      console.log('Password verification result:', isValid);

      if (!isValid) {
        console.log('❌ Password verification failed for ict.coordinator@ictu.edu.cm');
        console.log('Current hash:', specificUser[0].password.substring(0, 20) + '...');
      } else {
        console.log('✅ Password verification successful!');
      }
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('Full error:', error);
  } finally {
    process.exit(0);
  }
};

if (require.main === module) {
  checkUsers();
}
