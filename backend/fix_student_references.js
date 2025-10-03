const { sequelize } = require('./src/config/database');

async function fixStudentReferences() {
  try {
    console.log('🔧 Fixing student references...');
    
    // First, let's see what faculty_id values exist in students table
    const existingFaculties = await sequelize.query(
      "SELECT DISTINCT faculty_id FROM students WHERE faculty_id IS NOT NULL",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('Existing faculty IDs in students:', existingFaculties);
    
    // Update students with valid department and major references
    // For now, let's set all students to the first department and major
    await sequelize.query(`
      UPDATE students SET 
        department_id = '33333333-3333-3333-3333-333333333333',
        major_id = '77777777-7777-7777-7777-777777777777'
      WHERE department_id IS NULL OR major_id IS NULL
    `);
    console.log('✅ Updated students with department and major references');
    
    // Check how many students were updated
    const studentCount = await sequelize.query(
      "SELECT COUNT(*) as count FROM students WHERE department_id IS NOT NULL AND major_id IS NOT NULL",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`✅ ${studentCount[0].count} students now have proper references`);
    
    console.log('🎉 Student references fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing student references:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixStudentReferences();
