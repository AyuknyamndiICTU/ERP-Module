const { Client } = require('pg');

// Test database connection with the same credentials as the backend
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'educational_erp_dev',
  user: 'erp_user',
  password: 'erp_password'
});

async function testConnection() {
  try {
    console.log('Attempting to connect to PostgreSQL...');
    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    // Test a simple query
    const result = await client.query('SELECT COUNT(*) FROM users');
    console.log(`✅ Found ${result.rows[0].count} users in the database`);
    
    // Update admin password hash to correct one for 'password123'
    const newHash = '$2a$12$lQanGtneGhF/UnTjqVEEm.8jADgBk13JqEvjgwBsUqszp.Tl.hEpq';
    await client.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [newHash, 'admin@erp.local']
    );
    console.log('✅ Admin password hash updated');

    // Test login query with updated password hash
    const loginResult = await client.query(
      'SELECT id, email, password_hash, first_name, last_name, role, status FROM users WHERE email = $1',
      ['admin@erp.local']
    );

    if (loginResult.rows.length > 0) {
      console.log('✅ Admin user found:', loginResult.rows[0]);
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

testConnection();
