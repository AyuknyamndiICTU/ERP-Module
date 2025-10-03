const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'erp_system',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function checkUserEmails() {
  try {
    console.log('📧 Checking actual user emails in database...\n');
    
    const result = await pool.query(
      'SELECT email, role, is_active FROM users ORDER BY role, email'
    );
    
    console.log('Current users in database:');
    console.log('=' .repeat(50));
    
    result.rows.forEach(user => {
      const status = user.is_active ? '✅' : '❌';
      console.log(`${status} ${user.email} (${user.role})`);
    });
    
    console.log(`\nTotal users: ${result.rows.length}`);
    
    // Show test user credentials that should be used
    console.log('\n🔑 Correct test user credentials:');
    console.log('=' .repeat(50));
    
    const testUsers = result.rows.filter(user => 
      ['admin', 'faculty_coordinator', 'lecturer', 'hr_staff', 'finance_staff', 'student'].includes(user.role)
    );
    
    testUsers.forEach(user => {
      let password = 'admin123'; // default
      if (user.role === 'faculty_coordinator') password = 'coord123';
      else if (user.role === 'lecturer') password = 'lecturer123';
      else if (user.role === 'hr_staff') password = 'hr123';
      else if (user.role === 'finance_staff') password = 'finance123';
      else if (user.role === 'student') password = 'student123';
      
      console.log(`${user.role}: ${user.email} / ${password}`);
    });
    
  } catch (error) {
    console.error('Error checking user emails:', error);
  } finally {
    await pool.end();
  }
}

checkUserEmails();
