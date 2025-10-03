const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

// Import all models to ensure they're registered with Sequelize
require('../models/User');
require('../models/Student');
require('../models/Course');
require('../models/Faculty');
require('../models/Department');
require('../models/Employee');

/**
 * Sync database models to create missing tables and columns
 */
async function syncModels() {
  try {
    logger.info('Starting database model synchronization...');
    
    // Test database connection first
    await sequelize.authenticate();
    logger.info('Database connection established');
    
    // Sync all models with alter: true to add missing columns
    await sequelize.sync({ alter: true });
    logger.info('Database models synchronized successfully');
    
    // Verify faculties table exists
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('faculties', 'departments')
    `);
    
    logger.info('Existing tables:', results.map(r => r.table_name));
    
    // Check if faculty_id column exists in departments table
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'departments' 
      AND column_name = 'faculty_id'
    `);
    
    if (columns.length > 0) {
      logger.info('faculty_id column exists in departments table');
    } else {
      logger.warn('faculty_id column missing from departments table');
    }
    
    // Insert sample faculties if table is empty
    const Faculty = sequelize.models.Faculty;
    const facultyCount = await Faculty.count();
    
    if (facultyCount === 0) {
      await Faculty.bulkCreate([
        {
          name: 'Information and Communication Technology',
          code: 'ICT',
          description: 'Faculty of Information and Communication Technology',
          status: 'active'
        },
        {
          name: 'Business and Management Sciences',
          code: 'BMS',
          description: 'Faculty of Business and Management Sciences',
          status: 'active'
        }
      ]);
      logger.info('Sample faculties created');
    }
    
    logger.info('Model synchronization completed successfully');
    process.exit(0);
    
  } catch (error) {
    logger.error('Model synchronization failed:', error);
    process.exit(1);
  }
}

// Run the sync
syncModels();
