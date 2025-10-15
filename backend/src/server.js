const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const { connectDB } = require('./config/database');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { authenticateToken } = require('./middleware/auth');

// Import smart rate limiters
const {
  getEnvironmentLimiter,
  authLimiter,
  registerLimiter,
  academicLimiter,
  readOnlyLimiter,
  modificationLimiter
} = require('./middleware/smartRateLimit');

// Import models to ensure they are initialized
require('./models/Student');
require('./models/User');
require('./models/Course');
require('./models/Employee');
require('./models/FeeStructure');
require('./models/Faculty');
require('./models/Department');
require('./models/Major');
require('./models/Timetable');
require('./models/Grade');
require('./models/Complaint');
require('./models/Notification');
require('./models/FeeInstallment');
require('./models/StudentFinance');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const publicRoutes = require('./routes/public');
const studentRoutes = require('./routes/students');
const installmentRoutes = require('./routes/installments');
const courseRoutes = require('./routes/courses');
const gradeRoutes = require('./routes/grades');
const attendanceRoutes = require('./routes/attendance');
const financeRoutes = require('./routes/finance');
const hrRoutes = require('./routes/hr');
const userRoutes = require('./routes/users');
const academicRoutes = require('./routes/academic');
const facultyRoutes = require('./routes/faculties');
const departmentRoutes = require('./routes/departments');
const majorRoutes = require('./routes/majors');
const timetableRoutes = require('./routes/timetables');
const complaintRoutes = require('./routes/complaints');
const notificationRoutes = require('./routes/notifications');
const assignmentRoutes = require('./routes/assignments');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for rate limiting (required when behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Smart Rate Limiting
// Use environment-appropriate limiter (relaxed in development, strict in production)
const environmentLimiter = getEnvironmentLimiter();

// Apply general rate limiting to all API routes
app.use('/api/', environmentLimiter);

logger.info(`Rate limiting configured for ${process.env.NODE_ENV || 'development'} environment`);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes with specific rate limiters
// Public routes (no authentication required) - moderate limits
app.use('/api/public', readOnlyLimiter, publicRoutes);

// Authentication routes - strict limits to prevent brute force
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth', authRoutes);

// Profile routes - authenticated, relaxed limits
app.use('/api/profile', authenticateToken, readOnlyLimiter, profileRoutes);

// Academic routes - authenticated, high limits for normal usage
app.use('/api/students', authenticateToken, modificationLimiter, studentRoutes);
app.use('/api/courses', authenticateToken, readOnlyLimiter, courseRoutes);
app.use('/api/grades', authenticateToken, modificationLimiter, gradeRoutes);
app.use('/api/attendance', authenticateToken, modificationLimiter, attendanceRoutes);
app.use('/api/academic', authenticateToken, academicLimiter, academicRoutes);

// Finance routes - authenticated, moderate limits
app.use('/api/finance', authenticateToken, modificationLimiter, financeRoutes);
app.use('/api/installments', authenticateToken, modificationLimiter, installmentRoutes);

// HR routes - authenticated, moderate limits
app.use('/api/hr', authenticateToken, modificationLimiter, hrRoutes);

// User management - authenticated, moderate limits
app.use('/api/users', authenticateToken, modificationLimiter, userRoutes);

// Reference data - authenticated, high limits (read-only)
app.use('/api/faculties', authenticateToken, readOnlyLimiter, facultyRoutes);
app.use('/api/departments', authenticateToken, readOnlyLimiter, departmentRoutes);
app.use('/api/majors', authenticateToken, readOnlyLimiter, majorRoutes);

// Timetables and assignments - authenticated, moderate limits
app.use('/api/timetables', authenticateToken, modificationLimiter, timetableRoutes);
app.use('/api/assignments', authenticateToken, modificationLimiter, assignmentRoutes);

// Complaints and notifications - authenticated, moderate limits
app.use('/api/complaints', authenticateToken, modificationLimiter, complaintRoutes);
app.use('/api/notifications', authenticateToken, readOnlyLimiter, notificationRoutes);

// API documentation
if (process.env.NODE_ENV !== 'production') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('./config/swagger');
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  
  app.get('/api', (req, res) => {
    res.json({
      message: 'Educational ERP System API',
      version: '1.0.0',
      documentation: '/api-docs',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        academic: '/api/academic',
        finance: '/api/finance',
        hr: '/api/hr'
      }
    });
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  console.log('🔄 Backend server starting... (restarted)');
  // Try to connect to database (optional in development)
  try {
    const dbConnection = await connectDB();
    if (dbConnection) {
      logger.info('Database connected successfully');
    } else {
      logger.warn('Server starting without database connection');
    }
  } catch (error) {
    console.error('Database connection failed, continuing without database:', error);
  }

  try {
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server only if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
