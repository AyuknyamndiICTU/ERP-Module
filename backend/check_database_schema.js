const { sequelize } = require('./src/config/database');

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking database schema...');
    
    // Check students table
    const studentsColumns = await sequelize.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'students' ORDER BY ordinal_position",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('\n📋 Students table columns:');
    studentsColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check courses table
    const coursesColumns = await sequelize.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'courses' ORDER BY ordinal_position",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('\n📚 Courses table columns:');
    coursesColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check if tables exist
    const tables = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log('\n🗂️ Available tables:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkDatabaseSchema();
