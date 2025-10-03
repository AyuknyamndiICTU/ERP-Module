const express = require('express');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const logger = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by user role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/', (req, res) => {
  // TODO: Implement get all users
  res.status(501).json({
    success: false,
    message: 'Get users endpoint not implemented yet'
  });
});

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Check if database is connected
    if (!sequelize) {
      return res.status(503).json({
        success: false,
        error: 'Database not available'
      });
    }

    // Get user profile from database
    const users = await sequelize.query(
      `SELECT
        id, email, first_name, last_name, phone, role, is_active,
        last_login, created_at, bio, avatar_url
      FROM users
      WHERE id = :userId`,
      {
        replacements: { userId: req.user.userId },
        type: QueryTypes.SELECT
      }
    );

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];

    // Return user profile
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        name: `${user.first_name} ${user.last_name}`,
        phone: user.phone,
        role: user.role,
        status: user.is_active ? 'active' : 'inactive',
        bio: user.bio,
        profileImageUrl: user.avatar_url,
        lastLogin: user.last_login,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
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
 *               phone:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, bio, email } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'First name and last name are required'
      });
    }

    // Update user profile in database
    await sequelize.query(
      `UPDATE users SET 
        first_name = :firstName,
        last_name = :lastName,
        phone = :phone,
        bio = :bio,
        email = :email,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = :userId`,
      {
        replacements: { firstName, lastName, phone, bio, email, userId },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    // Get updated user data
    const users = await sequelize.query(
      `SELECT id, email, first_name, last_name, phone, role, bio
      FROM users WHERE id = :userId`,
      {
        replacements: { userId },
        type: QueryTypes.SELECT
      }
    );

    const user = users[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        bio: user.bio
      }
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id', (req, res) => {
  // TODO: Implement get user by ID
  res.status(501).json({
    success: false,
    message: 'Get user by ID endpoint not implemented yet'
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
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
 *               role:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/:id', (req, res) => {
  // TODO: Implement update user by ID
  res.status(501).json({
    success: false,
    message: 'Update user endpoint not implemented yet'
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', (req, res) => {
  // TODO: Implement delete user by ID
  res.status(501).json({
    success: false,
    message: 'Delete user endpoint not implemented yet'
  });
});

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
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
 *         description: Validation error or incorrect current password
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      });
    }

    // Get current user password
    const users = await sequelize.query(
      'SELECT password FROM users WHERE id = :userId',
      {
        replacements: { userId },
        type: QueryTypes.SELECT
      }
    );

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await sequelize.query(
      'UPDATE users SET password = :password, updated_at = CURRENT_TIMESTAMP WHERE id = :userId',
      {
        replacements: { password: hashedNewPassword, userId },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Avatar upload endpoint
router.post('/profile/avatar', authenticateToken, async (req, res) => {
  try {
    const { avatarData } = req.body;
    const userId = req.user.userId;

    if (!avatarData) {
      return res.status(400).json({
        success: false,
        error: 'Avatar data is required'
      });
    }

    // Update user avatar in database
    await sequelize.query(
      'UPDATE users SET profile_image_url = :avatarData, updated_at = CURRENT_TIMESTAMP WHERE id = :userId',
      {
        replacements: { avatarData, userId },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    res.json({
      success: true,
      message: 'Avatar updated successfully'
    });

  } catch (error) {
    logger.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user preferences
router.get('/profile/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // TODO: Preferences column doesn't exist yet, return default preferences
    const userPreferences = {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      dashboard: {
        showStats: true,
        showRecentActivity: true,
        showQuickActions: true
      },
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false
      },
      autoSave: true,
      compactView: false
    };

    res.json({
      success: true,
      preferences: userPreferences
    });

  } catch (error) {
    logger.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update user preferences
router.put('/profile/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const preferences = req.body;

    // Update user preferences in database
    await sequelize.query(
      'UPDATE users SET preferences = :preferences, updated_at = CURRENT_TIMESTAMP WHERE id = :userId',
      {
        replacements: { preferences: JSON.stringify(preferences), userId },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    res.json({
      success: true,
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Dashboard Statistics Route
/**
 * @swagger
 * /api/users/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    // Get basic statistics from the database
    const userStatsResult = await sequelize.query(`
      SELECT
        COUNT(CASE WHEN role = 'student' THEN 1 END) as total_students,
        COUNT(CASE WHEN role IN ('lecturer', 'faculty_coordinator') THEN 1 END) as total_faculty,
        COUNT(CASE WHEN role = 'hr_staff' THEN 1 END) as total_hr,
        COUNT(CASE WHEN role = 'finance_staff' THEN 1 END) as total_finance,
        COUNT(*) as total_users
      FROM users
      WHERE is_active = true
    `, { type: QueryTypes.SELECT });

    const userStats = userStatsResult[0] || {};

    // Mock additional statistics (these would come from actual tables in a real implementation)
    const stats = {
      academic: {
        totalStudents: parseInt(userStats.total_students) || 0,
        totalCourses: 156,
        activeEnrollments: parseInt(userStats.total_students) * 4 || 0,
        averageGrade: 85.4
      },
      finance: {
        totalRevenue: 1250000,
        monthlyGrowth: 12.5,
        pendingInvoices: 45,
        activeCampaigns: 8
      },
      hr: {
        totalEmployees: parseInt(userStats.total_hr) + parseInt(userStats.total_finance) + parseInt(userStats.total_faculty) || 89,
        activeLeaveRequests: 12,
        pendingReviews: 23,
        assetsAssigned: 156
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error fetching dashboard statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

module.exports = router;
