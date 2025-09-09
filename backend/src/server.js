const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { logger } = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

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
const assignmentRoutes = require('./routes/assignments');
const studentRoutes = require('./routes/students');
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

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter);

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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/users', userRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/majors', majorRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);

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
  // Try to connect to database (optional in development)
  try {
    const dbConnection = await connectDB();
    if (dbConnection) {
      logger.info('Database connected successfully');
    } else {
      logger.warn('Server starting without database connection');
    }
  } catch (error) {
    logger.error('Database connection failed, continuing without database:', error.message);
  }

  try {
    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      logger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
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
