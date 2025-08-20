const { sequelize } = require('./src/config/database');

async function testLoginQuery() {
  try {
    console.log('Testing login query...');
    
    // Test the exact query used in the login route
    const users = await sequelize.query(
      'SELECT id, email, password_hash, first_name, last_name, role, status FROM users WHERE email = :email',
      {
        replacements: { email: 'admin@erp.local' },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    console.log('Query result:', users);
    console.log('Number of users found:', users.length);
    
    if (users.length > 0) {
      console.log('User found:', users[0]);
    } else {
      console.log('No user found with email: admin@erp.local');
      
      // Let's check what users exist
      const allUsers = await sequelize.query(
        'SELECT email, first_name, last_name FROM users LIMIT 5',
        { type: sequelize.QueryTypes.SELECT }
      );
      console.log('First 5 users in database:', allUsers);
    }
    
  } catch (error) {
    console.error('Error testing login query:', error);
  } finally {
    await sequelize.close();
  }
}

testLoginQuery();
