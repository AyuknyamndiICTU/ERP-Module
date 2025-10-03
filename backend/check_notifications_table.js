const { sequelize } = require('./src/config/database');

async function checkNotificationsTable() {
  try {
    console.log('🔍 Checking notifications table structure...\n');
    
    // Get table structure
    const columns = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      ORDER BY ordinal_position;
    `, { type: sequelize.QueryTypes.SELECT });
    
    if (columns.length === 0) {
      console.log('❌ Notifications table does not exist');
      return;
    }
    
    console.log('📋 Notifications table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check if there are any notifications
    const [count] = await sequelize.query(
      'SELECT COUNT(*) as count FROM notifications',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`\n📊 Total notifications in database: ${count.count}`);
    
    // Show sample data if any exists
    if (count.count > 0) {
      const sample = await sequelize.query(
        'SELECT * FROM notifications LIMIT 3',
        { type: sequelize.QueryTypes.SELECT }
      );
      
      console.log('\n📝 Sample notifications:');
      sample.forEach((notif, index) => {
        console.log(`  ${index + 1}. ${notif.title} (${notif.type})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking notifications table:', error);
    process.exit(1);
  }
}

checkNotificationsTable();
