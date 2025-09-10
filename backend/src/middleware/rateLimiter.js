// API Rate Limiting Middleware
// Description: Production-ready rate limiting for API endpoints
// Date: 2025-09-09

const rateLimit = require('express-rate-limit');
const { logger } = require('../utils/logger');

// Memory store for rate limiting (in production, use Redis)
const MemoryStore = require('rate-limit-memory-store').MemoryStore;

// General API rate limiter
const generalLimiter = rateLimit({
  store: new MemoryStore({
    checkPeriod: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks and static assets
    return req.path === '/health' || req.path.startsWith('/api-docs');
  },
  onLimitReached: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
  }
});

// Authentication rate limiter (stricter limits)
const authLimiter = rateLimit({
  store: new MemoryStore({
    checkPeriod: 15 * 60 * 1000, // 15 minutes
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for logout and password reset requests
    return req.path === '/api/auth/logout' || req.path === '/api/auth/forgot-password';
  },
  onLimitReached: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
  }
});

// API endpoints rate limiter (moderate limits)
const apiLimiter = rateLimit({
  store: new MemoryStore({
    checkPeriod: 15 * 60 * 1000, // 15 minutes
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 API requests per windowMs
  message: {
    success: false,
    error: 'API rate limit exceeded, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  onLimitReached: (req, res) => {
    logger.warn(`API rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
  }
});

// File upload rate limiter (stricter limits)
const uploadLimiter = rateLimit({
  store: new MemoryStore({
    checkPeriod: 60 * 60 * 1000, // 1 hour
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 file uploads per hour
  message: {
    success: false,
    error: 'File upload rate limit exceeded, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  onLimitReached: (req, res) => {
    logger.warn(`Upload rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
  }
});

// Search and filter rate limiter (moderate limits)
const searchLimiter = rateLimit({
  store: new MemoryStore({
    checkPeriod: 5 * 60 * 1000, // 5 minutes
  }),
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // limit each IP to 30 search requests per windowMs
  message: {
    success: false,
    error: 'Search rate limit exceeded, please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  onLimitReached: (req, res) => {
    logger.warn(`Search rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
  }
});

// Admin operations rate limiter (stricter limits)
const adminLimiter = rateLimit({
  store: new MemoryStore({
    checkPeriod: 10 * 60 * 1000, // 10 minutes
  }),
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // limit each IP to 50 admin operations per windowMs
  message: {
    success: false,
    error: 'Admin operation rate limit exceeded, please try again later.',
    retryAfter: '10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  onLimitReached: (req, res) => {
    logger.warn(`Admin rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
  }
});

// User-specific rate limiter (based on user role)
const createUserRateLimiter = (maxRequests, windowMs, message) => {
  return rateLimit({
    store: new MemoryStore({
      checkPeriod: windowMs,
    }),
    windowMs: windowMs,
    max: maxRequests,
    message: {
      success: false,
      error: message,
      retryAfter: `${windowMs / (60 * 1000)} minutes`
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user?.id || req.ip;
    },
    onLimitReached: (req, res) => {
      const identifier = req.user?.id || req.ip;
      logger.warn(`User rate limit exceeded for: ${identifier}, Path: ${req.path}`);
    }
  });
};

// Role-based rate limiters
const studentLimiter = createUserRateLimiter(
  100, // 100 requests per window
  15 * 60 * 1000, // 15 minutes
  'Student rate limit exceeded, please try again later.'
);

const facultyLimiter = createUserRateLimiter(
  150, // 150 requests per window
  15 * 60 * 1000, // 15 minutes
  'Faculty rate limit exceeded, please try again later.'
);

const adminRoleLimiter = createUserRateLimiter(
  200, // 200 requests per window
  15 * 60 * 1000, // 15 minutes
  'Admin rate limit exceeded, please try again later.'
);

// Middleware to apply role-based rate limiting
const roleBasedLimiter = (req, res, next) => {
  if (!req.user) {
    return next(); // Skip if not authenticated
  }

  const role = req.user.role;

  switch (role) {
    case 'admin':
    case 'system_admin':
      return adminRoleLimiter(req, res, next);
    case 'lecturer':
    case 'faculty_coordinator':
    case 'major_coordinator':
      return facultyLimiter(req, res, next);
    case 'student':
      return studentLimiter(req, res, next);
    default:
      return next(); // Default rate limiting applies
  }
};

// Export all rate limiters
module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  searchLimiter,
  adminLimiter,
  roleBasedLimiter,
  createUserRateLimiter
};