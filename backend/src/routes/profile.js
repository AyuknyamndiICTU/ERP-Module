const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management endpoints
 */

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [user] = await sequelize.query(
      `SELECT id, email, first_name, last_name, role, is_active, created_at, last_login
       FROM users WHERE id = :id`,
      {
        replacements: { id: req.user.id },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile'
    });
  }
});

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }

    // Check if email is already taken by another user
    const [existingUser] = await sequelize.query(
      'SELECT id FROM users WHERE email = :email AND id != :id',
      {
        replacements: { email, id: req.user.id },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use by another user'
      });
    }

    // Update user profile
    await sequelize.query(
      `UPDATE users 
       SET first_name = :firstName, last_name = :lastName, email = :email, updated_at = NOW()
       WHERE id = :id`,
      {
        replacements: { firstName, lastName, email, id: req.user.id },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

/**
 * @swagger
 * /api/profile/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input or current password incorrect
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Get current user password
    const [user] = await sequelize.query(
      'SELECT password FROM users WHERE id = :id',
      {
        replacements: { id: req.user.id },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await sequelize.query(
      'UPDATE users SET password = :password, updated_at = NOW() WHERE id = :id',
      {
        replacements: { password: hashedNewPassword, id: req.user.id },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    logger.info(`Password changed for user ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password'
    });
  }
});

module.exports = router;
