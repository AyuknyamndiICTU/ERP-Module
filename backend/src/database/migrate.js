const { sequelize } = require('../config/database');
const { logger } = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

/**
 * Database Migration Script
 * This script handles database schema creation and updates
 */

class DatabaseMigrator {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../../../database/schema');
    this.seedsPath = path.join(__dirname, '../../../database/seeds');
  }

  /**
   * Run all database migrations
   */
  async runMigrations() {
    try {
      logger.info('Starting database migrations...');

      // Check if database connection is working
      await sequelize.authenticate();
      logger.info('Database connection established');

      // Get all schema files
      const schemaFiles = await this.getSchemaFiles();
      
      // Execute schema files in order
      for (const file of schemaFiles) {
        await this.executeSchemaFile(file);
      }

      logger.info('Database migrations completed successfully');
      return true;
    } catch (error) {
      logger.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Run database seeds
   */
  async runSeeds() {
    try {
      logger.info('Starting database seeding...');

      // Get all seed files
      const seedFiles = await this.getSeedFiles();
      
      // Execute seed files in order
      for (const file of seedFiles) {
        await this.executeSeedFile(file);
      }

      logger.info('Database seeding completed successfully');
      return true;
    } catch (error) {
      logger.error('Seeding failed:', error);
      throw error;
    }
  }

  /**
   * Get schema files in correct order
   */
  async getSchemaFiles() {
    try {
      const files = await fs.readdir(this.migrationsPath);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort(); // Files are named with prefixes for correct order
    } catch (error) {
      logger.error('Error reading schema files:', error);
      throw error;
    }
  }

  /**
   * Get seed files in correct order
   */
  async getSeedFiles() {
    try {
      const files = await fs.readdir(this.seedsPath);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort(); // Files are named with prefixes for correct order
    } catch (error) {
      logger.error('Error reading seed files:', error);
      throw error;
    }
  }

  /**
   * Execute a schema file
   */
  async executeSchemaFile(filename) {
    try {
      const filePath = path.join(this.migrationsPath, filename);
      const sql = await fs.readFile(filePath, 'utf8');
      
      logger.info(`Executing schema file: ${filename}`);
      
      // Split SQL file into individual statements
      const statements = this.splitSQLStatements(sql);
      
      // Execute each statement
      for (const statement of statements) {
        if (statement.trim()) {
          await sequelize.query(statement);
        }
      }
      
      logger.info(`Schema file executed successfully: ${filename}`);
    } catch (error) {
      logger.error(`Error executing schema file ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Execute a seed file
   */
  async executeSeedFile(filename) {
    try {
      const filePath = path.join(this.seedsPath, filename);
      const sql = await fs.readFile(filePath, 'utf8');
      
      logger.info(`Executing seed file: ${filename}`);
      
      // Split SQL file into individual statements
      const statements = this.splitSQLStatements(sql);
      
      // Execute each statement
      for (const statement of statements) {
        if (statement.trim()) {
          await sequelize.query(statement);
        }
      }
      
      logger.info(`Seed file executed successfully: ${filename}`);
    } catch (error) {
      logger.error(`Error executing seed file ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Split SQL content into individual statements
   */
  splitSQLStatements(sql) {
    // Remove comments but preserve dollar-quoted strings
    const lines = sql.split('\n');
    const cleanedLines = [];
    let inDollarQuoteClean = false;
    let dollarTagClean = '';

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and comments (but not inside dollar quotes)
      if (!inDollarQuoteClean && (trimmedLine === '' || trimmedLine.startsWith('--'))) {
        continue;
      }

      // Check for dollar quote start/end
      const dollarQuoteMatch = line.match(/\$([^$]*)\$/);
      if (dollarQuoteMatch) {
        const currentTag = dollarQuoteMatch[0];
        if (!inDollarQuoteClean) {
          inDollarQuoteClean = true;
          dollarTagClean = currentTag;
        } else if (currentTag === dollarTagClean) {
          inDollarQuoteClean = false;
          dollarTagClean = '';
        }
      }

      cleanedLines.push(line);
    }

    const cleanedSql = cleanedLines.join('\n');

    // Split by semicolon, but be careful with dollar-quoted strings
    const statements = [];
    let currentStatement = '';
    let inDollarQuote = false;
    let dollarTag = '';

    for (let i = 0; i < cleanedSql.length; i++) {
      const char = cleanedSql[i];
      currentStatement += char;

      // Check for dollar quote
      if (char === '$') {
        const remaining = cleanedSql.substring(i);
        const dollarQuoteMatch = remaining.match(/^\$([^$]*)\$/);
        if (dollarQuoteMatch) {
          const currentTag = dollarQuoteMatch[0];
          if (!inDollarQuote) {
            inDollarQuote = true;
            dollarTag = currentTag;
          } else if (currentTag === dollarTag) {
            inDollarQuote = false;
            dollarTag = '';
          }
          // Skip the tag part
          i += currentTag.length - 1;
          currentStatement += currentTag.substring(1);
        }
      }

      // Split on semicolon only if not in dollar quote
      if (char === ';' && !inDollarQuote) {
        const statement = currentStatement.trim();
        if (statement && statement !== ';') {
          statements.push(statement);
        }
        currentStatement = '';
      }
    }

    // Add the last statement if it exists
    const lastStatement = currentStatement.trim();
    if (lastStatement && lastStatement !== ';') {
      statements.push(lastStatement);
    }

    return statements.filter(statement => statement.trim() !== '');
  }

  /**
   * Check if migrations have been run
   */
  async checkMigrationStatus() {
    try {
      // Try to query a table that should exist after migrations
      await sequelize.query('SELECT 1 FROM users LIMIT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Reset database (drop all tables)
   */
  async resetDatabase() {
    try {
      logger.warn('Resetting database - this will drop all tables!');
      
      // Drop all tables
      await sequelize.drop();
      
      logger.info('Database reset completed');
      return true;
    } catch (error) {
      logger.error('Database reset failed:', error);
      throw error;
    }
  }

  /**
   * Create database backup
   */
  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `backup_${timestamp}.sql`;
      
      logger.info(`Creating database backup: ${backupName}`);
      
      // This would typically use pg_dump or similar tool
      // For now, we'll just log the action
      logger.info('Backup functionality would be implemented here');
      
      return backupName;
    } catch (error) {
      logger.error('Backup creation failed:', error);
      throw error;
    }
  }
}

/**
 * Main migration function
 */
async function migrate() {
  const migrator = new DatabaseMigrator();
  
  try {
    // Check if migrations are needed
    const migrationStatus = await migrator.checkMigrationStatus();
    
    if (!migrationStatus) {
      logger.info('Running initial database setup...');
      await migrator.runMigrations();
      
      // Run seeds in development environment
      if (process.env.NODE_ENV === 'development') {
        await migrator.runSeeds();
      }
    } else {
      logger.info('Database is already migrated');
    }
    
    logger.info('Migration process completed');
    process.exit(0);
  } catch (error) {
    logger.error('Migration process failed:', error);
    process.exit(1);
  }
}

/**
 * Seed function
 */
async function seed() {
  const migrator = new DatabaseMigrator();
  
  try {
    await migrator.runSeeds();
    logger.info('Seeding process completed');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding process failed:', error);
    process.exit(1);
  }
}

/**
 * Reset function
 */
async function reset() {
  const migrator = new DatabaseMigrator();
  
  try {
    await migrator.resetDatabase();
    await migrator.runMigrations();
    
    if (process.env.NODE_ENV === 'development') {
      await migrator.runSeeds();
    }
    
    logger.info('Database reset completed');
    process.exit(0);
  } catch (error) {
    logger.error('Database reset failed:', error);
    process.exit(1);
  }
}

// Export functions and class
module.exports = {
  DatabaseMigrator,
  migrate,
  seed,
  reset
};

// Run migration if this file is executed directly
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'seed':
      seed();
      break;
    case 'reset':
      reset();
      break;
    default:
      migrate();
      break;
  }
}
