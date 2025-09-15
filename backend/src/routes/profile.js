const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

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
      `SELECT id, email, first_name, last_name, phone, bio, role, is_active, created_at, last_login
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
        phone: user.phone,
        bio: user.bio,
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
    const { firstName, lastName, email, phone, bio } = req.body;

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
       SET first_name = :firstName, last_name = :lastName, email = :email, 
           phone = :phone, bio = :bio, updated_at = NOW()
       WHERE id = :id`,
      {
        replacements: { firstName, lastName, email, phone: phone || null, bio: bio || null, id: req.user.id },
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

/**
 * @swagger
 * /api/profile/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const [preferences] = await sequelize.query(
      `SELECT theme, language, timezone, email_notifications, push_notifications, 
              sms_notifications, auto_save, compact_view
       FROM user_preferences WHERE user_id = :userId`,
      {
        replacements: { userId: req.user.id },
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Return default preferences if none exist
    const defaultPreferences = {
      theme: 'system',
      language: 'en',
      timezone: 'Africa/Lagos',
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      autoSave: true,
      compactView: false
    };

    if (!preferences) {
      res.status(200).json({
        success: true,
        preferences: defaultPreferences
      });
    } else {
      res.status(200).json({
        success: true,
        preferences: {
          theme: preferences.theme || 'system',
          language: preferences.language || 'en',
          timezone: preferences.timezone || 'Africa/Lagos',
          emailNotifications: preferences.email_notifications !== false,
          pushNotifications: preferences.push_notifications !== false,
          smsNotifications: preferences.sms_notifications === true,
          autoSave: preferences.auto_save !== false,
          compactView: preferences.compact_view === true
        }
      });
    }

  } catch (error) {
    logger.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving preferences'
    });
  }
});

/**
 * @swagger
 * /api/profile/preferences:
 *   put:
 *     summary: Update user preferences
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
 *               theme:
 *                 type: string
 *                 enum: [light, dark, system]
 *               language:
 *                 type: string
 *               timezone:
 *                 type: string
 *               emailNotifications:
 *                 type: boolean
 *               pushNotifications:
 *                 type: boolean
 *               smsNotifications:
 *                 type: boolean
 *               autoSave:
 *                 type: boolean
 *               compactView:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const {
      theme,
      language,
      timezone,
      emailNotifications,
      pushNotifications,
      smsNotifications,
      autoSave,
      compactView
    } = req.body;

    // Check if preferences exist
    const [existingPrefs] = await sequelize.query(
      'SELECT user_id FROM user_preferences WHERE user_id = :userId',
      {
        replacements: { userId: req.user.id },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existingPrefs) {
      // Update existing preferences
      await sequelize.query(
        `UPDATE user_preferences 
         SET theme = :theme, language = :language, timezone = :timezone,
             email_notifications = :emailNotifications, push_notifications = :pushNotifications,
             sms_notifications = :smsNotifications, auto_save = :autoSave,
             compact_view = :compactView, updated_at = NOW()
         WHERE user_id = :userId`,
        {
          replacements: {
            theme: theme || 'system',
            language: language || 'en',
            timezone: timezone || 'Africa/Lagos',
            emailNotifications: emailNotifications !== false,
            pushNotifications: pushNotifications !== false,
            smsNotifications: smsNotifications === true,
            autoSave: autoSave !== false,
            compactView: compactView === true,
            userId: req.user.id
          },
          type: sequelize.QueryTypes.UPDATE
        }
      );
    } else {
      // Insert new preferences
      await sequelize.query(
        `INSERT INTO user_preferences 
         (user_id, theme, language, timezone, email_notifications, push_notifications,
          sms_notifications, auto_save, compact_view, created_at, updated_at)
         VALUES (:userId, :theme, :language, :timezone, :emailNotifications, :pushNotifications,
                 :smsNotifications, :autoSave, :compactView, NOW(), NOW())`,
        {
          replacements: {
            userId: req.user.id,
            theme: theme || 'system',
            language: language || 'en',
            timezone: timezone || 'Africa/Lagos',
            emailNotifications: emailNotifications !== false,
            pushNotifications: pushNotifications !== false,
            smsNotifications: smsNotifications === true,
            autoSave: autoSave !== false,
            compactView: compactView === true
          },
          type: sequelize.QueryTypes.INSERT
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating preferences'
    });
  }
});

/**
 * @swagger
 * /api/profile/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/avatar', authenticateToken, async (req, res) => {
  try {
    // For now, we'll simulate avatar upload
    // In a real implementation, you would use multer or similar for file handling
    const { avatarData } = req.body;

    if (!avatarData) {
      return res.status(400).json({
        success: false,
        message: 'Avatar data is required'
      });
    }

    // Update user avatar URL in database
    await sequelize.query(
      'UPDATE users SET avatar_url = :avatarUrl, updated_at = NOW() WHERE id = :id',
      {
        replacements: { avatarUrl: avatarData, id: req.user.id },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      avatarUrl: avatarData
    });

  } catch (error) {
    logger.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading avatar'
    });
  }
});

module.exports = router;
