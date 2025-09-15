const { sequelize } = require('./src/config/database');
const logger = require('./src/utils/logger');

async function updateDatabaseSchema() {
  try {
    console.log('Starting database schema updates...');

    // Add missing columns to users table
    console.log('Adding missing columns to users table...');
    
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    `);

    console.log('Users table updated successfully.');

    // Create user_preferences table
    console.log('Creating user_preferences table...');
    
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user_preferences_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT unique_user_preferences UNIQUE(user_id)
      );
    `);

    console.log('User preferences table created successfully.');

    // Create indexes for better performance
    console.log('Creating indexes...');
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    console.log('Indexes created successfully.');

    console.log('Database schema updates completed successfully!');
    
  } catch (error) {
    logger.error('Error updating database schema:', error);
    console.error('Failed to update database schema:', error.message);
    throw error;
  }
}

// Run the schema update if this file is executed directly
if (require.main === module) {
  updateDatabaseSchema()
    .then(() => {
      console.log('Schema update completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Schema update failed:', error);
      process.exit(1);
    });
}

module.exports = { updateDatabaseSchema };
