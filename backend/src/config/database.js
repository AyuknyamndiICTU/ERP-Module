const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

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
    max: process.env.DB_POOL_MAX || 10,  // Increased from 5 to 10
    min: process.env.DB_POOL_MIN || 2,   // Keep some connections ready
    acquire: 60000, // Timeout to acquire connection (60 seconds)
    idle: 30000,    // Increased idle time to 30 seconds
    evict: 10000    // Check for idle connections every 10 seconds
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

// Test database connection with retry logic
const connectDB = async (maxRetries = 5, delay = 5000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sequelize.authenticate();
      logger.info('Database connection established successfully');

      // Sync models in development (disabled to prevent connection issues)
      if (process.env.NODE_ENV === 'development') {
        // Temporarily disable auto-sync to prevent connection issues
        // await sequelize.sync({ alter: true });
        logger.info('Database models sync disabled (schema already exists)');
      }

      // Start health check interval
      startHealthCheck();

      return sequelize;
    } catch (error) {
      logger.error(`Database connection attempt ${attempt}/${maxRetries} failed:`, error.message);

      // If this was the last attempt
      if (attempt === maxRetries) {
        // In development, continue without database for testing
        if (process.env.NODE_ENV === 'development') {
          logger.warn('Continuing without database connection in development mode');
          return null;
        }
        throw new Error('Failed to connect to database after multiple attempts');
      }

      // Wait before retrying
      logger.info(`Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Database health check
const checkDatabaseHealth = async () => {
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Database connection is healthy');
    }
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error.message);
    return false;
  }
};

// Start periodic health checks
let healthCheckInterval;
const startHealthCheck = () => {
  // Check every 5 minutes
  healthCheckInterval = setInterval(async () => {
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      logger.warn('Database connection unhealthy, attempting to reconnect...');
      try {
        await sequelize.authenticate();
        logger.info('Database connection restored');
      } catch (error) {
        logger.error('Failed to restore database connection:', error.message);
      }
    }
  }, 5 * 60 * 1000);
};

// Stop health checks
const stopHealthCheck = () => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
};

// Close database connection
const closeDB = async () => {
  try {
    stopHealthCheck();
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
  closeDB,
  checkDatabaseHealth,
  startHealthCheck,
  stopHealthCheck
};
