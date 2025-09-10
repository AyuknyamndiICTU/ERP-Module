const { sequelize } = require('./src/config/database');
const bcrypt = require('bcryptjs');

const createTestUser = async () => {
  try {
    console.log('🔧 Creating test user...');

    // Delete existing test user if it exists
    await sequelize.query(
      'DELETE FROM users WHERE email = :email',
      { replacements: { email: 'test@example.com' } }
    );

    // Generate proper bcrypt hash
    const passwordHash = await bcrypt.hash('password123', 12);

    // Create test user
    const result = await sequelize.query(
      `INSERT INTO users (email, password, first_name, last_name, role, is_active, created_at, updated_at)
       VALUES (:email, :password, :firstName, :lastName, :role, true, NOW(), NOW())
       RETURNING id, email, first_name, last_name, role`,
      {
        replacements: {
          email: 'test@example.com',
          password: passwordHash,
          firstName: 'Test',
          lastName: 'User',
          role: 'admin'
        },
        type: sequelize.QueryTypes.INSERT
      }
    );

    console.log('✅ Test user created successfully!');
    console.log('📞 Try logging in with:');
    console.log('  Email: test@example.com');
    console.log('  Password: password123');

    // Verify the password works
    const [user] = result[0];
    const isPasswordValid = await bcrypt.compare('password123', passwordHash);
    console.log('✅ Password verification:', isPasswordValid ? 'SUCCESS' : 'FAILED');

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  } finally {
    process.exit(0);
  }
};

if (require.main === module) {
  createTestUser();
}
