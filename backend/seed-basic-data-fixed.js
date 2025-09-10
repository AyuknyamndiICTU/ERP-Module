// Fixed Basic Data Seeding Script
// Execute with: node seed-basic-data-fixed.js

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'erp_user',
  password: 'erp_password',
  database: 'educational_erp_dev'
});

async function seedBasicData() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('Starting basic data seeding...');

    // Phase 1: Users
    console.log('Phase 1: Seeding users...');
    await client.query(`
      INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at) VALUES
      (uuid_generate_v4(), 'admin@erp.local', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2jS', 'System', 'Administrator', 'admin', true, NOW(), NOW()),
      (uuid_generate_v4(), 'lecturer@erp.local', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2jS', 'John', 'Smith', 'lecturer', true, NOW(), NOW()),
      (uuid_generate_v4(), 'alice.student@erp.local', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2jS', 'Alice', 'Williams', 'student', true, NOW(), NOW()),
      (uuid_generate_v4(), 'bob.student@erp.local', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2jS', 'Bob', 'Brown', 'student', true, NOW(), NOW()),
      (uuid_generate_v4(), 'finance@erp.local', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2jS', 'Finance', 'Manager', 'finance_staff', true, NOW(), NOW()),
      (uuid_generate_v4(), 'hr@erp.local', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmHqU2jS', 'HR', 'Manager', 'hr_staff', true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
    `);
    console.log('✅ Users seeded successfully');

    // Phase 2: Faculties
    console.log('Phase 2: Seeding faculties...');
    await client.query(`
      INSERT INTO faculties (id, name, code, description, status, created_at, updated_at) VALUES
      (uuid_generate_v4(), 'Faculty of Science and Technology', 'FST', 'Science and technology disciplines', 'active', NOW(), NOW()),
      (uuid_generate_v4(), 'Faculty of Business', 'FB', 'Business and management studies', 'active', NOW(), NOW())
      ON CONFLICT (name) DO NOTHING
    `);
    console.log('✅ Faculties seeded successfully');

    console.log('🎉 Basic data seeding completed successfully!');

    // Verification
    console.log('\n📊 Data Verification:');
    const tables = ['users', 'faculties'];
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`  ${table}: ${result.rows[0].count} records`);
    }

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

// Run the seeding
seedBasicData().catch(console.error);