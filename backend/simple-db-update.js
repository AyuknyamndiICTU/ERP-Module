const { sequelize } = require('./src/config/database');

async function updateSchema() {
  try {
    // Add columns to users table
    await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`);
    await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`);
    await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`);
    console.log('Users table updated');

    // Create user_preferences table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        theme VARCHAR(20) DEFAULT 'system',
        language VARCHAR(10) DEFAULT 'en',
        timezone VARCHAR(50) DEFAULT 'Africa/Lagos',
        email_notifications BOOLEAN DEFAULT true,
        push_notifications BOOLEAN DEFAULT true,
        sms_notifications BOOLEAN DEFAULT false,
        auto_save BOOLEAN DEFAULT true,
        compact_view BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('User preferences table created');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateSchema();
