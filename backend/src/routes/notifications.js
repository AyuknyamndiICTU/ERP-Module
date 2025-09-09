const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { logger } = require('../utils/logger');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { isRead, category, type } = req.query;
    
    const whereClause = { 
      recipientId: req.user.id,
      [Op.or]: [
        { expiresAt: null },
        { expiresAt: { [Op.gt]: new Date() } }
      ]
    };
    
    if (isRead !== undefined) whereClause.isRead = isRead === 'true';
    if (category) whereClause.category = category;
    if (type) whereClause.type = type;

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    logger.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
});

/**
 * @swagger
 * /api/notifications/popup:
 *   get:
 *     summary: Get popup notifications for user
 *     tags: [Notifications]
 */
router.get('/popup', authenticateToken, async (req, res) => {
  try {
    const popupNotifications = await Notification.findAll({
      where: {
        recipientId: req.user.id,
        isPopup: true,
        popupShown: false,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } }
        ]
      },
      order: [['priority', 'DESC'], ['createdAt', 'DESC']],
      limit: 5
    });

    // Mark popup notifications as shown
    if (popupNotifications.length > 0) {
      await Notification.update(
        { popupShown: true },
        {
          where: {
            id: { [Op.in]: popupNotifications.map(n => n.id) }
          }
        }
      );
    }

    res.json({
      success: true,
      notifications: popupNotifications
    });
  } catch (error) {
    logger.error('Error fetching popup notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popup notifications'
    });
  }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 */
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: {
        id,
        recipientId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.update({ isRead: true });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification'
    });
  }
});

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 */
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      {
        where: {
          recipientId: req.user.id,
          isRead: false
        }
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notifications'
    });
  }
});

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create notification (admin/coordinators only)
 *     tags: [Notifications]
 */
router.post('/',
  authenticateToken,
  roleAuth(['admin', 'faculty_coordinator', 'major_coordinator', 'finance_staff']),
  [
    body('recipientId').isInt().withMessage('Valid recipient ID required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('type').optional().isIn(['info', 'warning', 'error', 'success', 'reminder']),
    body('category').optional().isIn(['academic', 'finance', 'system', 'complaint', 'deadline', 'general']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        recipientId,
        title,
        message,
        type,
        category,
        isPopup,
        priority,
        expiresAt,
        metadata
      } = req.body;

      const notification = await Notification.create({
        recipientId,
        senderId: req.user.id,
        title,
        message,
        type: type || 'info',
        category: category || 'general',
        isPopup: isPopup || false,
        priority: priority || 'medium',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        metadata: metadata || {}
      });

      logger.info(`Notification created for user ${recipientId} by ${req.user.id}`);

      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        notification
      });
    } catch (error) {
      logger.error('Error creating notification:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating notification'
      });
    }
  }
);

module.exports = router;
