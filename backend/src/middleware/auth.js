const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

/**
 * Middleware to verify JWT token and authenticate user
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token is required'
      });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production', (err, user) => {
      if (err) {
        logger.warn('Invalid token attempt:', err.message);
        return res.status(403).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }

      // Add user info to request
      req.user = user;
      next();
    });
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Middleware to check if user has required role
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Convert single role to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware to check if user is academic staff or admin
 */
const requireAcademicStaff = requireRole(['admin', 'academic_staff']);

/**
 * Middleware to check if user is HR personnel or admin
 */
const requireHRPersonnel = requireRole(['admin', 'hr_personnel']);

/**
 * Middleware to check if user is finance staff or admin
 */
const requireFinanceStaff = requireRole(['admin', 'finance_staff']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireAcademicStaff,
  requireHRPersonnel,
  requireFinanceStaff
};
