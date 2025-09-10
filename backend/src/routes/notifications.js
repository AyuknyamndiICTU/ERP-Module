const express = require('express');
const router = express.Router();
const { body, validationResult, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { logger } = require('../utils/logger');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { Op } = require('sequelize');

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - recipientId
 *         - title
 *         - message
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         recipientId:
 *           type: string
 *           format: uuid
 *         senderId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         type:
 *           type: string
 *           enum: [info, warning, error, success, reminder]
 *         category:
 *           type: string
 *           enum: [academic, finance, system, complaint, deadline, general]
 *         isRead:
 *           type: boolean
 *         isPopup:
 *           type: boolean
 *         popupShown:
 *           type: boolean
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         metadata:
 *           type: object
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get notifications for current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [academic, finance, system, complaint, deadline, general]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 unreadCount:
 *                   type: integer
 *                 totalCount:
 *                   type: integer
 */
router.get('/',
  authenticateToken,
  [
    query('isRead').optional().isBoolean(),
    query('category').optional().isIn(['academic', 'finance', 'system', 'complaint', 'deadline', 'general']),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const recipientId = req.user.id;
      const {
        isRead,
        category,
        priority,
        limit = 50,
        offset = 0
      } = req.query;

      // Build WHERE conditions
      const whereConditions = {
        recipientId,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } }
        ]
      };

      if (isRead !== undefined) whereConditions.isRead = isRead;
      if (category) whereConditions.category = category;
      if (priority) whereConditions.priority = priority;

      // Get notifications with sender info
      const notifications = await Notification.findAll({
        where: whereConditions,
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['firstName', 'lastName', 'email'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ['priority', 'DESC'],
          ['createdAt', 'DESC']
        ]
      });

      // Get unread count
      const unreadCount = await Notification.count({
        where: {
          recipientId,
          isRead: false,
          [Op.or]: [
            { expiresAt: null },
            { expiresAt: { [Op.gt]: new Date() } }
          ]
        }
      });

      // Get total count
      const totalCount = await Notification.count({
        where: whereConditions
      });

      logger.info(`Retrieved ${notifications.length} notifications for user ${recipientId}`);

      res.json({
        notifications,
        unreadCount,
        totalCount,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
        }
      });

    } catch (error) {
      logger.error('Error fetching notifications:', error);
      res.status(500).json({
        message: 'Error fetching notifications',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       403:
 *         description: Not authorized to update this notification
 *       404:
 *         description: Notification not found
 */
router.put('/:id/read',
  authenticateToken,
  [param('id').isUUID()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const userId = req.user.id;

      // Find notification
      const notification = await Notification.findByPk(id);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      // Check if user owns this notification
      if (notification.recipientId !== userId) {
        return res.status(403).json({
          message: 'You are not authorized to update this notification'
        });
      }

      // Mark as read and popup shown
      await notification.update({
        isRead: true,
        popupShown: true
      });

      logger.info(`Notification ${id} marked as read by user ${userId}`);

      res.json({
        message: 'Notification marked as read',
        notification: {
          id: notification.id,
          isRead: notification.isRead,
          popupShown: notification.popupShown
        }
      });

    } catch (error) {
      logger.error('Error updating notification:', error);
      res.status(500).json({
        message: 'Error updating notification',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.put('/read-all',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;

      // Mark all unread notifications as read
      const [affectedRows] = await Notification.update(
        {
          isRead: true,
          popupShown: true
        },
        {
          where: {
            recipientId: userId,
            isRead: false,
            [Op.or]: [
              { expiresAt: null },
              { expiresAt: { [Op.gt]: new Date() } }
            ]
          }
        }
      );

      logger.info(`${affectedRows} notifications marked as read by user ${userId}`);

      res.json({
        message: 'All notifications marked as read',
        updated: affectedRows
      });

    } catch (error) {
      logger.error('Error updating notifications:', error);
      res.status(500).json({
        message: 'Error updating notifications',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       403:
 *         description: Not authorized to delete this notification
 *       404:
 *         description: Notification not found
 */
router.delete('/:id',
  authenticateToken,
  [param('id').isUUID()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const userId = req.user.id;

      // Find notification
      const notification = await Notification.findByPk(id);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      // Check if user owns this notification
      if (notification.recipientId !== userId) {
        return res.status(403).json({
          message: 'You are not authorized to delete this notification'
        });
      }

      // Delete notification
      await notification.destroy();

      logger.info(`Notification ${id} deleted by user ${userId}`);

      res.json({
        message: 'Notification deleted successfully'
      });

    } catch (error) {
      logger.error('Error deleting notification:', error);
      res.status(500).json({
        message: 'Error deleting notification',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Send notification to users (Admin/Coordinator only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientIds
 *               - title
 *               - message
 *             properties:
 *               recipientIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [info, warning, error, success, reminder]
 *                 default: info
 *               category:
 *                 type: string
 *                 enum: [academic, finance, system, complaint, deadline, general]
 *                 default: general
 *               isPopup:
 *                 type: boolean
 *                 default: false
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Notifications sent successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized to send notifications
 */
router.post('/send',
  authenticateToken,
  roleAuth(['admin', 'system_admin', 'faculty_coordinator', 'major_coordinator']),
  [
    body('recipientIds').isArray().withMessage('Recipient IDs array is required'),
    body('recipientIds.*').isUUID().withMessage('Valid recipient ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('type').optional().isIn(['info', 'warning', 'error', 'success', 'reminder']),
    body('category').optional().isIn(['academic', 'finance', 'system', 'complaint', 'deadline', 'general']),
    body('isPopup').optional().isBoolean(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('expiresAt').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const senderId = req.user.id;
      const {
        recipientIds,
        title,
        message,
        type = 'info',
        category = 'general',
        isPopup = false,
        priority = 'medium',
        expiresAt
      } = req.body;

      // Create notifications for all recipients
      const notifications = recipientIds.map(recipientId => ({
        recipientId,
        senderId,
        title,
        message,
        type,
        category,
        isPopup,
        priority,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }));

      const createdNotifications = await Notification.bulkCreate(notifications);

      logger.info(`${createdNotifications.length} notifications sent by user ${senderId}`);

      res.status(201).json({
        message: 'Notifications sent successfully',
        sent: createdNotifications.length,
        notifications: createdNotifications.map(n => ({
          id: n.id,
          recipientId: n.recipientId,
          title: n.title,
          type: n.type,
          priority: n.priority
        }))
      });

    } catch (error) {
      logger.error('Error sending notifications:', error);
      res.status(500).json({
        message: 'Error sending notifications',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/notifications/broadcast:
 *   post:
 *     summary: Broadcast notification to all users in a role/faculty (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, lecturer, faculty_coordinator, major_coordinator, finance_staff, hr_staff, marketing_staff]
 *               facultyId:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *                 enum: [info, warning, error, success, reminder]
 *                 default: info
 *               category:
 *                 type: string
 *                 enum: [academic, finance, system, complaint, deadline, general]
 *                 default: general
 *               isPopup:
 *                 type: boolean
 *                 default: true
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Broadcast notification sent successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized to broadcast notifications
 */
router.post('/broadcast',
  authenticateToken,
  roleAuth(['admin', 'system_admin']),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('role').optional().isIn(['student', 'lecturer', 'faculty_coordinator', 'major_coordinator', 'finance_staff', 'hr_staff', 'marketing_staff']),
    body('facultyId').optional().isUUID(),
    body('type').optional().isIn(['info', 'warning', 'error', 'success', 'reminder']),
    body('category').optional().isIn(['academic', 'finance', 'system', 'complaint', 'deadline', 'general']),
    body('isPopup').optional().isBoolean(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('expiresAt').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const senderId = req.user.id;
      const {
        title,
        message,
        role,
        facultyId,
        type = 'info',
        category = 'general',
        isPopup = true,
        priority = 'medium',
        expiresAt
      } = req.body;

      // Build WHERE conditions for recipients
      const whereConditions = {};

      if (role) {
        whereConditions.role = role;
      }

      if (facultyId) {
        // Find students in the specified faculty
        const students = await User.findAll({
          include: [{
            model: require('../models/Student'),
            where: { facultyId },
            required: true
          }]
        });
        const studentIds = students.map(s => s.id);
        whereConditions.id = { [Op.in]: studentIds };
      }

      // Get all recipients
      const recipients = await User.findAll({
        where: whereConditions,
        attributes: ['id']
      });

      if (recipients.length === 0) {
        return res.status(400).json({
          message: 'No recipients found matching the criteria'
        });
      }

      // Create notifications for all recipients
      const notifications = recipients.map(recipient => ({
        recipientId: recipient.id,
        senderId,
        title,
        message,
        type,
        category,
        isPopup,
        priority,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }));

      const createdNotifications = await Notification.bulkCreate(notifications);

      logger.info(`Broadcast notification sent to ${createdNotifications.length} users by admin ${senderId}`);

      res.status(201).json({
        message: 'Broadcast notification sent successfully',
        sent: createdNotifications.length,
        criteria: {
          role,
          facultyId,
          type,
          category,
          priority
        }
      });

    } catch (error) {
      logger.error('Error broadcasting notification:', error);
      res.status(500).json({
        message: 'Error broadcasting notification',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unreadCount:
 *                   type: integer
 *                 urgentCount:
 *                   type: integer
 */
router.get('/unread-count',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;

      // Get total unread count
      const unreadCount = await Notification.count({
        where: {
          recipientId: userId,
          isRead: false,
          [Op.or]: [
            { expiresAt: null },
            { expiresAt: { [Op.gt]: new Date() } }
          ]
        }
      });

      // Get urgent unread count
      const urgentCount = await Notification.count({
        where: {
          recipientId: userId,
          isRead: false,
          priority: 'urgent',
          [Op.or]: [
            { expiresAt: null },
            { expiresAt: { [Op.gt]: new Date() } }
          ]
        }
      });

      res.json({
        unreadCount,
        urgentCount
      });

    } catch (error) {
      logger.error('Error fetching unread count:', error);
      res.status(500).json({
        message: 'Error fetching unread count',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
