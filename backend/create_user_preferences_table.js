const { sequelize } = require('./src/config/database');

async function createUserPreferencesTable() {
  try {
    console.log('🔧 Creating user_preferences table and adding avatar_url column...\n');
    
    // Create user_preferences table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
        language VARCHAR(10) DEFAULT 'en',
        timezone VARCHAR(50) DEFAULT 'Africa/Lagos',
        email_notifications BOOLEAN DEFAULT true,
        push_notifications BOOLEAN DEFAULT true,
        sms_notifications BOOLEAN DEFAULT false,
        auto_save BOOLEAN DEFAULT true,
        compact_view BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );
    `);
    console.log('✅ user_preferences table created');
    
    // Create index for faster lookups
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
    `);
    console.log('✅ Index created on user_preferences.user_id');
    
    // Add avatar_url column to users table if it doesn't exist
    await sequelize.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    `);
    console.log('✅ avatar_url column added to users table');
    
    console.log('\n🎉 Database schema updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user preferences table:', error);
    process.exit(1);
  }
}

createUserPreferencesTable();
