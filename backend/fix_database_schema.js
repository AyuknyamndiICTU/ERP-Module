const { sequelize } = require('./src/config/database');

async function fixDatabaseSchema() {
  try {
    console.log('🔧 Fixing database schema...');
    
    // Add missing department_id column to students table
    try {
      await sequelize.query(`
        ALTER TABLE students 
        ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id)
      `);
      console.log('✅ Added department_id column to students table');
    } catch (error) {
      console.log('⚠️ department_id column may already exist:', error.message);
    }
    
    // Add missing major_id column to students table
    try {
      await sequelize.query(`
        ALTER TABLE students 
        ADD COLUMN IF NOT EXISTS major_id UUID REFERENCES majors(id)
      `);
      console.log('✅ Added major_id column to students table');
    } catch (error) {
      console.log('⚠️ major_id column may already exist:', error.message);
    }
    
    // Add missing difficulty column to courses table
    try {
      await sequelize.query(`
        ALTER TABLE courses 
        ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) CHECK (difficulty IN ('Undergraduate', 'Master', 'PhD'))
      `);
      console.log('✅ Added difficulty column to courses table');
    } catch (error) {
      console.log('⚠️ difficulty column may already exist:', error.message);
    }
    
    // Add missing department_id column to courses table
    try {
      await sequelize.query(`
        ALTER TABLE courses 
        ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id)
      `);
      console.log('✅ Added department_id column to courses table');
    } catch (error) {
      console.log('⚠️ department_id column may already exist:', error.message);
    }
    
    // Create departments table if it doesn't exist
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS departments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          code VARCHAR(10) UNIQUE NOT NULL,
          description TEXT,
          faculty_id UUID REFERENCES faculties(id),
          head_id UUID REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created departments table');
    } catch (error) {
      console.log('⚠️ departments table may already exist:', error.message);
    }
    
    // Create majors table if it doesn't exist
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS majors (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          code VARCHAR(10) UNIQUE NOT NULL,
          description TEXT,
          level VARCHAR(20) CHECK (level IN ('Undergraduate', 'Master', 'PhD')),
          department_id UUID REFERENCES departments(id),
          coordinator_id UUID REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created majors table');
    } catch (error) {
      console.log('⚠️ majors table may already exist:', error.message);
    }
    
    // Create faculties table if it doesn't exist
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS faculties (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          code VARCHAR(10) UNIQUE NOT NULL,
          description TEXT,
          dean_id UUID REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created faculties table');
    } catch (error) {
      console.log('⚠️ faculties table may already exist:', error.message);
    }
    
    console.log('🎉 Database schema fixes completed!');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixDatabaseSchema();
