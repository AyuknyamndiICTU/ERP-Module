const fs = require('fs');
const path = require('path');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('✅ Database directory created');
}

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  const envContent = fs.readFileSync(envExamplePath, 'utf8');
  // Modify for SQLite
  const sqliteEnv = envContent
    .replace('DB_DIALECT=postgres', 'DB_DIALECT=sqlite')
    .replace('# Database Configuration', '# Database Configuration\nDB_DIALECT=sqlite\nDB_STORAGE=./database/ictu_erp.sqlite');
  
  fs.writeFileSync(envPath, sqliteEnv);
  console.log('✅ .env file created with SQLite configuration');
}

console.log('🚀 Database setup complete! You can now start the server with: npm start');
