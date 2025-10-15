const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Smart Rate Limiter with user-specific and role-based limits
 * 
 * Features:
 * - Different limits for authenticated vs unauthenticated users
 * - Admin bypass
 * - User-specific tracking (by user ID instead of IP)
 * - Configurable per endpoint
 */

/**
 * Create a smart rate limiter with custom options
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} options.max - Max requests per window (default: 200)
 * @param {number} options.maxAuthenticated - Max requests for authenticated users (default: 500)
 * @param {boolean} options.skipAdmin - Skip rate limiting for admin users (default: true)
 * @param {string} options.message - Custom error message
 * @returns {Function} Express middleware
 */
const createSmartRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 200, // Unauthenticated users
    maxAuthenticated = 500, // Authenticated users
    skipAdmin = true,
    message = 'Too many requests. Please wait a moment and try again.'
  } = options;

  return rateLimit({
    windowMs,
    max: (req) => {
      // Higher limit for authenticated users
      if (req.user?.id) {
        return maxAuthenticated;
      }
      return max;
    },
    
    // Use user ID for authenticated requests, IP for unauthenticated
    keyGenerator: (req) => {
      if (req.user?.id) {
        return `user_${req.user.id}`;
      }
      return req.ip || req.connection.remoteAddress;
    },
    
    // Skip rate limiting for admin users
    skip: (req) => {
      if (!skipAdmin) return false;
      
      const adminRoles = ['admin', 'system_admin'];
      return req.user?.role && adminRoles.includes(req.user.role);
    },
    
    // Custom handler for rate limit exceeded
    handler: (req, res) => {
      const retryAfter = Math.ceil(windowMs / 1000);
      
      logger.warn(`Rate limit exceeded for ${req.user?.id || req.ip} on ${req.path}`);
      
      res.status(429).json({
        success: false,
        error: message,
        retryAfter,
        limit: req.user?.id ? maxAuthenticated : max,
        windowMs
      });
    },
    
    // Return rate limit info in headers
    standardHeaders: true,
    legacyHeaders: false,
    
    // Store rate limit data in memory (can be changed to Redis for production)
    store: undefined // Uses default memory store
  });
};

/**
 * Predefined rate limiters for common use cases
 */

// General API rate limiter (relaxed)
const generalApiLimiter = createSmartRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Unauthenticated
  maxAuthenticated: 500, // Authenticated
  message: 'Too many API requests. Please try again later.'
});

// Strict rate limiter for authentication endpoints
const authLimiter = createSmartRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 login attempts per 15 minutes
  maxAuthenticated: 20,
  skipAdmin: false, // Don't skip for admin (they need to login first)
  message: 'Too many login attempts. Please try again in 15 minutes.'
});

// Very strict rate limiter for registration
const registerLimiter = createSmartRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Only 5 registration attempts per hour
  maxAuthenticated: 10,
  skipAdmin: false,
  message: 'Too many registration attempts. Please try again later.'
});

// Relaxed rate limiter for authenticated academic endpoints
const academicLimiter = createSmartRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  maxAuthenticated: 1000, // Very high limit for authenticated users
  message: 'Too many requests to academic endpoints. Please slow down.'
});

// Moderate rate limiter for data modification endpoints
const modificationLimiter = createSmartRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  maxAuthenticated: 200,
  message: 'Too many modification requests. Please try again later.'
});

// Lenient rate limiter for read-only endpoints
const readOnlyLimiter = createSmartRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  maxAuthenticated: 1000,
  message: 'Too many read requests. Please try again later.'
});

// Development mode - very relaxed limits
const developmentLimiter = createSmartRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10000, // Essentially unlimited
  maxAuthenticated: 10000,
  skipAdmin: true
});

/**
 * Get appropriate rate limiter based on environment
 */
const getEnvironmentLimiter = () => {
  if (process.env.NODE_ENV === 'development') {
    logger.info('Using development rate limiter (relaxed limits)');
    return developmentLimiter;
  }
  return generalApiLimiter;
};

module.exports = {
  createSmartRateLimiter,
  generalApiLimiter,
  authLimiter,
  registerLimiter,
  academicLimiter,
  modificationLimiter,
  readOnlyLimiter,
  developmentLimiter,
  getEnvironmentLimiter
};
