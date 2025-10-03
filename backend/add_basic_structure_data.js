const { sequelize } = require('./src/config/database');

async function addBasicStructureData() {
  try {
    console.log('🏗️ Adding basic structure data...');
    
    // Add faculties
    await sequelize.query(`
      INSERT INTO faculties (id, name, code, description, created_at, updated_at) VALUES 
      ('11111111-1111-1111-1111-111111111111', 'ICT Faculty', 'ICT', 'Information and Communication Technology Faculty', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('22222222-2222-2222-2222-222222222222', 'BMS Faculty', 'BMS', 'Business and Management Sciences Faculty', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (code) DO NOTHING
    `);
    console.log('✅ Added faculties');
    
    // Add departments
    await sequelize.query(`
      INSERT INTO departments (id, name, code, description, faculty_id, created_at, updated_at) VALUES 
      ('33333333-3333-3333-3333-333333333333', 'Computer Science', 'CS', 'Computer Science Department', '11111111-1111-1111-1111-111111111111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('44444444-4444-4444-4444-444444444444', 'Information Technology', 'IT', 'Information Technology Department', '11111111-1111-1111-1111-111111111111', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('55555555-5555-5555-5555-555555555555', 'Business Administration', 'BA', 'Business Administration Department', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('66666666-6666-6666-6666-666666666666', 'Management', 'MGT', 'Management Department', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (code) DO NOTHING
    `);
    console.log('✅ Added departments');
    
    // Add majors
    await sequelize.query(`
      INSERT INTO majors (id, name, code, description, level, department_id, created_at, updated_at) VALUES 
      ('77777777-7777-7777-7777-777777777777', 'Software Engineering', 'SE', 'Software Engineering Program', 'Undergraduate', '33333333-3333-3333-3333-333333333333', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('88888888-8888-8888-8888-888888888888', 'Network Administration', 'NA', 'Network Administration Program', 'Undergraduate', '44444444-4444-4444-4444-444444444444', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('99999999-9999-9999-9999-999999999999', 'Business Management', 'BM', 'Business Management Program', 'Undergraduate', '55555555-5555-5555-5555-555555555555', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Project Management', 'PM', 'Project Management Program', 'Master', '66666666-6666-6666-6666-666666666666', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (code) DO NOTHING
    `);
    console.log('✅ Added majors');
    
    // Update existing courses with department_id and difficulty
    await sequelize.query(`
      UPDATE courses SET 
        department_id = '33333333-3333-3333-3333-333333333333',
        difficulty = 'Undergraduate'
      WHERE department_id IS NULL
    `);
    console.log('✅ Updated courses with department and difficulty');
    
    console.log('🎉 Basic structure data added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding structure data:', error.message);
  } finally {
    await sequelize.close();
  }
}

addBasicStructureData();
