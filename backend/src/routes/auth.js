const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/database');
const { logger } = require('../utils/logger');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           description: User's email address
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         role:
 *           type: string
 *           enum: [admin, academic_staff, student, hr_personnel, finance_staff, marketing_team]
 *           description: User's role in the system
 *         isActive:
 *           type: boolean
 *           description: Whether the user account is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, academic_staff, student, hr_personnel, finance_staff, marketing_team]
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Server error
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'student' } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await sequelize.query(
      'SELECT id FROM users WHERE email = :email',
      {
        replacements: { email },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [result] = await sequelize.query(
      `INSERT INTO users (email, password, first_name, last_name, role, is_active, created_at, updated_at)
       VALUES (:email, :password, :firstName, :lastName, :role, true, NOW(), NOW())
       RETURNING id, email, first_name, last_name, role, created_at`,
      {
        replacements: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role
        },
        type: sequelize.QueryTypes.INSERT
      }
    );

    const user = result[0];

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Check if database is connected
    if (!sequelize) {
      logger.warn('Database not connected, using demo mode');
      return res.status(503).json({
        success: false,
        error: 'Database not available. Please check database connection.'
      });
    }

    // Find user in database
    const users = await sequelize.query(
      'SELECT id, email, password, first_name, last_name, role, is_active FROM users WHERE email = :email',
      {
        replacements: { email },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Account is not active. Please contact administrator.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Update last login
    await sequelize.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = :userId',
      {
        replacements: { userId: user.id },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    // Log successful login
    logger.info(`User logged in successfully: ${user.email}`);

    // Return success response
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can track logout events for security
    logger.info('User logout requested');
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const user = await sequelize.query(
      'SELECT id, email FROM users WHERE email = :email AND is_active = true',
      {
        replacements: { email },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (user.length === 0) {
      // Don't reveal if email exists for security
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Update user with reset token
    await sequelize.query(
      'UPDATE users SET reset_token = :resetToken, reset_token_expiry = :resetTokenExpiry WHERE email = :email',
      {
        replacements: { resetToken, resetTokenExpiry, email },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    // In production, send email here
    logger.info(`Password reset requested for ${email}`);

    res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Find user with valid reset token
    const user = await sequelize.query(
      'SELECT id, email FROM users WHERE reset_token = :token AND reset_token_expiry > NOW() AND is_active = true',
      {
        replacements: { token },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (user.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await sequelize.query(
      'UPDATE users SET password = :password, reset_token = NULL, reset_token_expiry = NULL WHERE id = :id',
      {
        replacements: { password: hashedPassword, id: user[0].id },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    logger.info(`Password reset completed for user ${user[0].email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Server error
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Get user data
    const user = await sequelize.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = :id AND is_active = true',
      {
        replacements: { id: decoded.id },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newToken = jwt.sign(
      { 
        id: user[0].id, 
        email: user[0].email, 
        role: user[0].role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    res.status(200).json({
      success: true,
      token: newToken,
      user: {
        id: user[0].id,
        email: user[0].email,
        firstName: user[0].first_name,
        lastName: user[0].last_name,
        role: user[0].role
      }
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

module.exports = router;
