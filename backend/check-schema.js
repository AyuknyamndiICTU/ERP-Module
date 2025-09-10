// Check database schema
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'erp_user',
  password: 'erp_password',
  database: 'educational_erp_dev'
});

async function checkSchema() {
  try {
    await client.connect();
    console.log('Checking faculties table schema...');

    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'faculties'
        AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    console.log('Faculties table columns:');
    result.rows.forEach(col => {
      console.log('  ' + col.column_name + ': ' + col.data_type + ' (' + col.is_nullable + ')');
    });

  } catch (error) {
    console.error('Schema check failed:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema();