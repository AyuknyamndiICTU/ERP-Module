const { Client } = require('pg');

// PostgreSQL setup script
async function setupDatabase() {
  // First, try to connect with the application credentials
  const appClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'erp_user',
    password: 'erp_password',
    database: 'educational_erp_dev'
  });

  try {
    console.log('🔄 Testing application database connection...');
    await appClient.connect();
    console.log('✅ Database and user already exist and are working!');
    await appClient.end();
    return;
  } catch (error) {
    console.log('⚠️  Application database connection failed, setting up...');
  }

  // If that fails, try to connect as postgres user with common passwords
  const postgresPasswords = ['postgres', 'password', '', 'admin'];
  let connectedClient = null;

  for (const pwd of postgresPasswords) {
    try {
      const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: pwd,
        database: 'postgres'
      });

      console.log(`🔄 Trying to connect with password: ${pwd || '(empty)'}`);
      await client.connect();
      console.log('✅ Connected to PostgreSQL successfully');
      connectedClient = client;
      break;
    } catch (err) {
      console.log(`❌ Failed with password: ${pwd || '(empty)'} - ${err.message}`);
    }
  }

  if (!connectedClient) {
    throw new Error('Could not connect to PostgreSQL. Please ensure PostgreSQL is running and you have the correct credentials.');
  }

  try {
    // Create database if it doesn't exist
    console.log('🔄 Creating database educational_erp_dev...');
    await connectedClient.query(`
      SELECT 'CREATE DATABASE educational_erp_dev'
      WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'educational_erp_dev')\\gexec
    `);
    console.log('✅ Database educational_erp_dev ready');

    // Create user if it doesn't exist
    console.log('🔄 Creating user erp_user...');
    await connectedClient.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'erp_user') THEN
          CREATE ROLE erp_user LOGIN PASSWORD 'erp_password';
        END IF;
      END
      $$;
    `);
    console.log('✅ User erp_user ready');

    // Grant privileges
    console.log('🔄 Granting privileges...');
    await connectedClient.query('GRANT ALL PRIVILEGES ON DATABASE educational_erp_dev TO erp_user');
    console.log('✅ Privileges granted');

    console.log('🎉 PostgreSQL setup completed successfully!');
    console.log('📋 Summary:');
    console.log('   - Database: educational_erp_dev');
    console.log('   - User: erp_user');
    console.log('   - Password: erp_password');
    console.log('   - Host: localhost:5432');

  } catch (error) {
    console.error('❌ Error during setup:', error.message);
    throw error;
  } finally {
    await connectedClient.end();
  }
}

// Test the connection with the new credentials
async function testConnection() {
  const testClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'erp_user',
    password: 'erp_password',
    database: 'educational_erp_dev'
  });

  try {
    console.log('🔄 Testing connection with erp_user...');
    await testClient.connect();
    console.log('✅ Connection test successful!');
    const result = await testClient.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', result.rows[0].version.split(' ')[1]);
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    throw error;
  } finally {
    await testClient.end();
  }
}

// Run setup
async function main() {
  try {
    await setupDatabase();
    await testConnection();
    console.log('\n🚀 Database setup complete! You can now start your backend server.');
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure PostgreSQL is running: netstat -ano | findstr :5432');
    console.log('2. Check PostgreSQL service: services.msc (look for postgresql)');
    console.log('3. Try different postgres password or create user manually');
    console.log('4. Check pg_hba.conf for authentication settings');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { setupDatabase, testConnection };