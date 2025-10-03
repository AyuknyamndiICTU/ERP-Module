// Simplified API Rate Limiting Middleware
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  onLimitReached: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
  }
});

// Authentication rate limiter (stricter limits)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  onLimitReached: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
  }
});

// API endpoints rate limiter
const apiLimiter = rateLimit({
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

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter
};
