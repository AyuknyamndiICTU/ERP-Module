const { Sequelize } = require('sequelize');
const { logger } = require('../utils/logger');

// Database configuration
const config = {
  // PostgreSQL configuration
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'educational_erp_dev',
  username: process.env.DB_USER || 'erp_user',
  password: process.env.DB_PASSWORD || 'erp_password',
  dialect: process.env.DB_DIALECT || 'postgres',

  logging: process.env.NODE_ENV === 'development' ?
    (msg) => logger.debug(msg) : false,
  pool: {
    max: 5, // Reduced from 10 to prevent connection pool exhaustion
    min: 0,
    acquire: 60000, // Increased timeout to 60 seconds
    idle: 20000 // Increased idle time
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  // Add retry configuration
  retry: {
    max: 3,
    backoffBase: 100,
    backoffExponent: 1.5
  }
};

// Create Sequelize instance for PostgreSQL
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: config.logging,
  pool: config.pool,
  define: config.define,
  retry: config.retry
});

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync models in development (disabled to prevent connection issues)
    if (process.env.NODE_ENV === 'development') {
      // Temporarily disable auto-sync to prevent connection issues
      // await sequelize.sync({ alter: true });
      logger.info('Database models sync disabled (schema already exists)');
    }

    return sequelize;
  } catch (error) {
    logger.error('Unable to connect to the database:', error.message);

    // In development, continue without database for testing
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Continuing without database connection in development mode');
      return null;
    }

    throw error;
  }
};

// Close database connection
const closeDB = async () => {
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  connectDB,
  closeDB
};
