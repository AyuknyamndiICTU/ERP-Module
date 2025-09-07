const { sequelize } = require('../config/database');
const { User, Student, Course, Employee, FeeStructure } = require('../models');
const { seedDatabase } = require('./seeders');
const { logger } = require('../utils/logger');

const initializeDatabase = async () => {
  try {
    logger.info('Initializing database...');

    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established');

    // Sync all models (create tables)
    await sequelize.sync({ force: false, alter: true });
    logger.info('Database tables synchronized');

    // Check if database is empty and seed if needed
    const userCount = await User.count();
    if (userCount === 0) {
      logger.info('Database is empty, seeding with initial data...');
      await seedDatabase();
    } else {
      logger.info(`Database already contains ${userCount} users, skipping seeding`);
    }

    logger.info('Database initialization completed');
    return true;

  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

module.exports = { initializeDatabase };
