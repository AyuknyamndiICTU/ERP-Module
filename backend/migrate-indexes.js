// Database Performance Indexes Migration
const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'erp_user',
  password: 'erp_password',
  database: 'educational_erp_dev'
});

async function migrateIndexes() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('Reading performance indexes migration file...');
    const sql = fs.readFileSync('../database/migrations/006_add_performance_indexes.sql', 'utf8');

    // Split by semicolon and filter out comments and empty statements
    const statements = sql.split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log('Found ' + statements.length + ' SQL statements to execute');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          console.log('Executing statement ' + (i + 1) + '...');
          await client.query(statement);
          console.log('✅ Statement ' + (i + 1) + ' executed successfully');
          successCount++;
        } catch (error) {
          console.log('❌ Statement ' + (i + 1) + ' failed:', error.message);
          if (error.message.includes('already exists')) {
            console.log('Index already exists, continuing...');
            successCount++;
          } else {
            errorCount++;
          }
        }
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log('✅ Successful: ' + successCount + ' statements');
    console.log('❌ Failed: ' + errorCount + ' statements');

    if (successCount > 0) {
      console.log('\n🔍 Verifying created indexes...');
      const result = await client.query(`
        SELECT schemaname, tablename, indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname LIKE 'idx_%'
        ORDER BY tablename, indexname
      `);

      console.log('Found ' + result.rows.length + ' performance indexes:');
      result.rows.forEach(row => {
        console.log('  ✅ ' + row.tablename + '.' + row.indexname);
      });
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

// Run the migration
migrateIndexes().catch(console.error);