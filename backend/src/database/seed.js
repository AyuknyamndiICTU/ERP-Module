const { DatabaseMigrator } = require('./migrate');
const { logger } = require('../utils/logger');

/**
 * Database Seeding Script
 * This script populates the database with initial sample data
 */

async function seed() {
  const migrator = new DatabaseMigrator();
  
  try {
    logger.info('Starting database seeding...');
    await migrator.runSeeds();
    logger.info('Seeding process completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding process failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seed();
}

module.exports = { seed };
