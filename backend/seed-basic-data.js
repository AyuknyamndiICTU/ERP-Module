// Basic Data Seeding Script
// Execute with: node seed-basic-data.js

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
      INSERT INTO faculties (id, name, description, created_at, updated_at) VALUES
      (uuid_generate_v4(), 'Faculty of Science and Technology', 'Science and technology disciplines', NOW(), NOW()),
      (uuid_generate_v4(), 'Faculty of Business', 'Business and management studies', NOW(), NOW())
      ON CONFLICT (name) DO NOTHING
    `);
    console.log('✅ Faculties seeded successfully');

    // Phase 3: Departments
    console.log('Phase 3: Seeding departments...');
    await client.query(`
      INSERT INTO departments (id, name, description, faculty_id, budget, cost_center, location, phone, email, is_active, created_at, updated_at)
      SELECT
        uuid_generate_v4(),
        'Computer Science',
        'Computer Science Department',
        f.id,
        500000.00,
        'CS001',
        'Building A',
        '+237-123-4567',
        'cs@erp.local',
        true,
        NOW(),
        NOW()
      FROM faculties f WHERE f.name = 'Faculty of Science and Technology'
      UNION ALL
      SELECT
        uuid_generate_v4(),
        'Business Administration',
        'Business Administration Department',
        f.id,
        400000.00,
        'BA001',
        'Building B',
        '+237-123-4568',
        'ba@erp.local',
        true,
        NOW(),
        NOW()
      FROM faculties f WHERE f.name = 'Faculty of Business'
    `);
    console.log('✅ Departments seeded successfully');

    // Phase 4: Majors
    console.log('Phase 4: Seeding majors...');
    await client.query(`
      INSERT INTO majors (id, name, description, department_id, created_at, updated_at)
      SELECT
        uuid_generate_v4(),
        'Software Engineering',
        'Software development and engineering',
        d.id,
        NOW(),
        NOW()
      FROM departments d WHERE d.name = 'Computer Science'
      UNION ALL
      SELECT
        uuid_generate_v4(),
        'Marketing',
        'Marketing and sales management',
        d.id,
        NOW(),
        NOW()
      FROM departments d WHERE d.name = 'Business Administration'
    `);
    console.log('✅ Majors seeded successfully');

    // Phase 5: Students
    console.log('Phase 5: Seeding students...');
    await client.query(`
      INSERT INTO students (id, matricule, user_id, first_name, last_name, email, phone, faculty_id, department_id, major_id, semester, level, enrollment_date, registration_year, status, gpa, total_credits, created_at, updated_at)
      SELECT
        uuid_generate_v4(),
        'CS2025001',
        u.id,
        'Alice',
        'Williams',
        'alice.student@erp.local',
        '+237-111-1111',
        f.id,
        d.id,
        m.id,
        2,
        2,
        '2023-09-01'::date,
        2025,
        'active',
        3.8,
        65,
        NOW(),
        NOW()
      FROM users u
      CROSS JOIN faculties f
      CROSS JOIN departments d
      CROSS JOIN majors m
      WHERE u.email = 'alice.student@erp.local'
        AND f.name = 'Faculty of Science and Technology'
        AND d.name = 'Computer Science'
        AND m.name = 'Software Engineering'
      UNION ALL
      SELECT
        uuid_generate_v4(),
        'BA2025001',
        u.id,
        'Bob',
        'Brown',
        'bob.student@erp.local',
        '+237-111-1112',
        f.id,
        d.id,
        m.id,
        1,
        1,
        '2024-09-01'::date,
        2025,
        'active',
        3.5,
        32,
        NOW(),
        NOW()
      FROM users u
      CROSS JOIN faculties f
      CROSS JOIN departments d
      CROSS JOIN majors m
      WHERE u.email = 'bob.student@erp.local'
        AND f.name = 'Faculty of Business'
        AND d.name = 'Business Administration'
        AND m.name = 'Marketing'
    `);
    console.log('✅ Students seeded successfully');

    console.log('🎉 Basic data seeding completed successfully!');

    // Verification
    console.log('\n📊 Data Verification:');
    const tables = ['users', 'faculties', 'departments', 'majors', 'students'];
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