const { sequelize } = require('./src/config/database');

async function addFinalMissingColumns() {
  try {
    console.log('🔧 Adding final missing columns...');
    
    // Add registration_locked column to students table
    try {
      await sequelize.query(`
        ALTER TABLE students 
        ADD COLUMN IF NOT EXISTS registration_locked BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Added registration_locked column to students table');
    } catch (error) {
      console.log('⚠️ registration_locked column may already exist:', error.message);
    }
    
    // Update existing students with default value
    await sequelize.query(`
      UPDATE students SET 
        registration_locked = FALSE
      WHERE registration_locked IS NULL
    `);
    console.log('✅ Updated students with registration_locked default value');
    
    console.log('🎉 Final missing columns added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding final missing columns:', error.message);
  } finally {
    await sequelize.close();
  }
}

addFinalMissingColumns();
