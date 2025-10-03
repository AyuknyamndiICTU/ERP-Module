const { sequelize } = require('./src/config/database');

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing columns...');
    
    // Add semester column to students table
    try {
      await sequelize.query(`
        ALTER TABLE students 
        ADD COLUMN IF NOT EXISTS semester INTEGER CHECK (semester >= 1 AND semester <= 2)
      `);
      console.log('✅ Added semester column to students table');
    } catch (error) {
      console.log('⚠️ semester column may already exist:', error.message);
    }
    
    // Add level column to students table if missing
    try {
      await sequelize.query(`
        ALTER TABLE students 
        ADD COLUMN IF NOT EXISTS level INTEGER CHECK (level >= 1 AND level <= 4)
      `);
      console.log('✅ Added level column to students table');
    } catch (error) {
      console.log('⚠️ level column may already exist:', error.message);
    }
    
    // Add student_type column to students table if missing
    try {
      await sequelize.query(`
        ALTER TABLE students 
        ADD COLUMN IF NOT EXISTS student_type VARCHAR(20) CHECK (student_type IN ('regular', 'transfer')) DEFAULT 'regular'
      `);
      console.log('✅ Added student_type column to students table');
    } catch (error) {
      console.log('⚠️ student_type column may already exist:', error.message);
    }
    
    // Add registration_year column to students table if missing
    try {
      await sequelize.query(`
        ALTER TABLE students 
        ADD COLUMN IF NOT EXISTS registration_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
      `);
      console.log('✅ Added registration_year column to students table');
    } catch (error) {
      console.log('⚠️ registration_year column may already exist:', error.message);
    }
    
    // Update existing students with default values
    await sequelize.query(`
      UPDATE students SET 
        semester = 1,
        level = 1,
        student_type = 'regular',
        registration_year = EXTRACT(YEAR FROM CURRENT_DATE)
      WHERE semester IS NULL OR level IS NULL OR student_type IS NULL OR registration_year IS NULL
    `);
    console.log('✅ Updated students with default values');
    
    console.log('🎉 Missing columns added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding missing columns:', error.message);
  } finally {
    await sequelize.close();
  }
}

addMissingColumns();
