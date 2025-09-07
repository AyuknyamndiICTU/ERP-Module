const { sequelize } = require('../src/config/database');
const bcrypt = require('bcryptjs');

// Test database setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = 'educational_erp_test';
  
  try {
    // Sync database with force to clear existing data
    await sequelize.sync({ force: true });
    console.log('Test database synchronized');
    
    // Create test users
    await createTestUsers();
    console.log('Test users created');
    
  } catch (error) {
    console.error('Test setup failed:', error);
  }
});

afterAll(async () => {
  try {
    await sequelize.close();
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error closing test database:', error);
  }
});

// Create test users for different roles
async function createTestUsers() {
  const testUsers = [
    {
      email: 'admin@test.com',
      password: await bcrypt.hash('Admin@123', 12),
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true
    },
    {
      email: 'student@test.com',
      password: await bcrypt.hash('Student@123', 12),
      firstName: 'Test',
      lastName: 'Student',
      role: 'student',
      isActive: true
    },
    {
      email: 'faculty@test.com',
      password: await bcrypt.hash('Faculty@123', 12),
      firstName: 'Test',
      lastName: 'Faculty',
      role: 'academic_staff',
      isActive: true
    },
    {
      email: 'hr@test.com',
      password: await bcrypt.hash('HR@123', 12),
      firstName: 'HR',
      lastName: 'Manager',
      role: 'hr_personnel',
      isActive: true
    },
    {
      email: 'finance@test.com',
      password: await bcrypt.hash('Finance@123', 12),
      firstName: 'Finance',
      lastName: 'Manager',
      role: 'finance_staff',
      isActive: true
    }
  ];

  // Insert test users into database
  for (const user of testUsers) {
    try {
      await sequelize.query(`
        INSERT INTO users (email, password, first_name, last_name, role, is_active, created_at, updated_at)
        VALUES (:email, :password, :firstName, :lastName, :role, :isActive, NOW(), NOW())
        ON CONFLICT (email) DO NOTHING
      `, {
        replacements: user,
        type: sequelize.QueryTypes.INSERT
      });
    } catch (error) {
      console.log(`User ${user.email} might already exist or table not ready`);
    }
  }
}

module.exports = {
  createTestUsers
};
