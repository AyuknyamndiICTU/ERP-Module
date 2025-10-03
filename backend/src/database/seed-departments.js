const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Seed sample departments and faculties data
 */
async function seedDepartments() {
  try {
    logger.info('Starting departments seeding...');
    
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Insert sample faculties first (if they don't exist)
    await sequelize.query(`
      INSERT INTO faculties (id, name, code, description, status, created_at, updated_at) VALUES
      ('11111111-1111-1111-1111-111111111111', 'Information and Communication Technology', 'ICT', 'Faculty of Information and Communication Technology', 'active', NOW(), NOW()),
      ('22222222-2222-2222-2222-222222222222', 'Business and Management Sciences', 'BMS', 'Faculty of Business and Management Sciences', 'active', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
    
    // Insert sample departments with faculty relationships
    await sequelize.query(`
      INSERT INTO departments (id, name, code, description, faculty_id, status, created_at, updated_at) VALUES
      ('33333333-3333-3333-3333-333333333333', 'Computer Science', 'CS', 'Department of Computer Science', '11111111-1111-1111-1111-111111111111', 'active', NOW(), NOW()),
      ('44444444-4444-4444-4444-444444444444', 'Information Technology', 'IT', 'Department of Information Technology', '11111111-1111-1111-1111-111111111111', 'active', NOW(), NOW()),
      ('55555555-5555-5555-5555-555555555555', 'Software Engineering', 'SE', 'Department of Software Engineering', '11111111-1111-1111-1111-111111111111', 'active', NOW(), NOW()),
      ('66666666-6666-6666-6666-666666666666', 'Business Administration', 'BA', 'Department of Business Administration', '22222222-2222-2222-2222-222222222222', 'active', NOW(), NOW()),
      ('77777777-7777-7777-7777-777777777777', 'Marketing', 'MKT', 'Department of Marketing', '22222222-2222-2222-2222-222222222222', 'active', NOW(), NOW()),
      ('88888888-8888-8888-8888-888888888888', 'Finance', 'FIN', 'Department of Finance', '22222222-2222-2222-2222-222222222222', 'active', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
    
    // Insert sample majors
    await sequelize.query(`
      INSERT INTO majors (id, name, code, description, level, status, created_at, updated_at) VALUES
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Bachelor of Computer Science', 'BCS', 'Undergraduate program in Computer Science', 'Undergraduate', 'active', NOW(), NOW()),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bachelor of Information Technology', 'BIT', 'Undergraduate program in Information Technology', 'Undergraduate', 'active', NOW(), NOW()),
      ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Bachelor of Software Engineering', 'BSE', 'Undergraduate program in Software Engineering', 'Undergraduate', 'active', NOW(), NOW()),
      ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Master of Computer Science', 'MCS', 'Graduate program in Computer Science', 'Master', 'active', NOW(), NOW()),
      ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Bachelor of Business Administration', 'BBA', 'Undergraduate program in Business Administration', 'Undergraduate', 'active', NOW(), NOW()),
      ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Master of Business Administration', 'MBA', 'Graduate program in Business Administration', 'Master', 'active', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);
    
    logger.info('Sample data seeded successfully');
    
    // Verify the data
    const [faculties] = await sequelize.query('SELECT COUNT(*) as count FROM faculties');
    const [departments] = await sequelize.query('SELECT COUNT(*) as count FROM departments');
    const [majors] = await sequelize.query('SELECT COUNT(*) as count FROM majors');
    
    logger.info(`Seeded data counts - Faculties: ${faculties[0].count}, Departments: ${departments[0].count}, Majors: ${majors[0].count}`);
    
    process.exit(0);
    
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDepartments();
