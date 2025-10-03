const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'educational_erp',
  process.env.DB_USER || 'postgres', 
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

async function checkTables() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 Available tables:');
    results.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Check if we have any data
    if (results.length > 0) {
      console.log('\n📊 Table row counts:');
      for (const row of results) {
        try {
          const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM ${row.table_name}`);
          console.log(`- ${row.table_name}: ${countResult[0].count} rows`);
        } catch (error) {
          console.log(`- ${row.table_name}: Error counting rows`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTables();
