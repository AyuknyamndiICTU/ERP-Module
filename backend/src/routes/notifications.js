const express = require('express');
const router = express.Router();
const { body, validationResult, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const logger = require('../utils/logger');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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

      const userId = req.user.userId;
      const {
        isRead,
        category,
        priority,
        limit = 50,
        offset = 0
      } = req.query;

      // Build WHERE conditions for raw SQL query
      let whereClause = 'WHERE user_id = :userId';
      const replacements = { userId };

      if (isRead !== undefined) {
        whereClause += ' AND is_read = :isRead';
        replacements.isRead = isRead === 'true';
      }

      // Parse metadata for category and priority filters
      if (category) {
        whereClause += " AND metadata->>'category' = :category";
        replacements.category = category;
      }

      if (priority) {
        whereClause += " AND metadata->>'priority' = :priority";
        replacements.priority = priority;
      }

      // Add expiration filter
      whereClause += ' AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)';

      // Get notifications using raw SQL - build the full query
      let fullQuery = `
        SELECT 
          id,
          user_id as recipientId,
          title,
          message,
          type,
          is_read as isRead,
          read_at as readAt,
          action_url as actionUrl,
          action_text as actionText,
          expires_at as expiresAt,
          metadata,
          created_at as createdAt
        FROM notifications 
        WHERE user_id = '${userId}'
      `;
      
      if (isRead !== undefined) {
        fullQuery += ` AND is_read = ${isRead === 'true'}`;
      }
      
      if (category) {
        fullQuery += ` AND metadata->>'category' = '${category}'`;
      }
      
      if (priority) {
        fullQuery += ` AND metadata->>'priority' = '${priority}'`;
      }
      
      fullQuery += ` AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        ORDER BY 
          CASE 
            WHEN metadata->>'priority' = 'urgent' THEN 4
            WHEN metadata->>'priority' = 'high' THEN 3
            WHEN metadata->>'priority' = 'medium' THEN 2
            ELSE 1
          END DESC,
          created_at DESC
        LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
      `;

      const notifications = await sequelize.query(fullQuery, {
        type: QueryTypes.SELECT
      });

      // Parse metadata for each notification
      const formattedNotifications = notifications.map(notif => {
        let parsedMetadata = {};
        try {
          parsedMetadata = typeof notif.metadata === 'string' ? JSON.parse(notif.metadata) : (notif.metadata || {});
        } catch (e) {
          parsedMetadata = {};
        }
        
        return {
          ...notif,
          metadata: parsedMetadata,
          category: parsedMetadata?.category || 'general',
          priority: parsedMetadata?.priority || 'medium'
        };
      });

      // Get unread count
      const [unreadResult] = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE user_id = '${userId}' 
        AND is_read = false 
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      `, {
        type: QueryTypes.SELECT
      });

      // Get total count - build count query
      let countQuery = `SELECT COUNT(*) as count FROM notifications WHERE user_id = '${userId}'`;
      
      if (isRead !== undefined) {
        countQuery += ` AND is_read = ${isRead === 'true'}`;
      }
      
      if (category) {
        countQuery += ` AND metadata->>'category' = '${category}'`;
      }
      
      if (priority) {
        countQuery += ` AND metadata->>'priority' = '${priority}'`;
      }
      
      countQuery += ` AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`;

      const [totalResult] = await sequelize.query(countQuery, {
        type: QueryTypes.SELECT
      });

      logger.info(`Retrieved ${formattedNotifications.length} notifications for user ${userId}`);

      res.json({
        notifications: formattedNotifications,
        unreadCount: parseInt(unreadResult.count),
        totalCount: parseInt(totalResult.count),
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < parseInt(totalResult.count)
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
      const userId = req.user.userId;

      // Update notification using raw SQL
      const [result] = await sequelize.query(`
        UPDATE notifications 
        SET is_read = true, read_at = CURRENT_TIMESTAMP 
        WHERE id = '${id}' AND user_id = '${userId}'
        RETURNING id, is_read, read_at
      `, {
        type: sequelize.QueryTypes.UPDATE
      });

      if (!result || result.length === 0) {
        return res.status(404).json({ 
          message: 'Notification not found or you are not authorized to update it' 
        });
      }

      logger.info(`Notification ${id} marked as read by user ${userId}`);

      res.json({
        message: 'Notification marked as read',
        notification: {
          id: result[0].id,
          isRead: result[0].is_read,
          readAt: result[0].read_at
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
      const userId = req.user.userId;

      // Mark all unread notifications as read using raw SQL
      const [result] = await sequelize.query(`
        UPDATE notifications 
        SET is_read = true, read_at = CURRENT_TIMESTAMP 
        WHERE user_id = '${userId}' 
        AND is_read = false 
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      `, {
        type: sequelize.QueryTypes.UPDATE
      });

      const affectedRows = result.rowCount || 0;

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
      const userId = req.user.userId;

      // Delete notification using raw SQL
      const result = await sequelize.query(`
        DELETE FROM notifications 
        WHERE id = '${id}' AND user_id = '${userId}'
      `, {
        type: sequelize.QueryTypes.DELETE
      });

      // For DELETE queries, check the result metadata
      const deletedRows = (result && result[1] && result[1].rowCount) ? result[1].rowCount : 0;
      
      if (deletedRows === 0) {
        return res.status(404).json({ 
          message: 'Notification not found or you are not authorized to delete it' 
        });
      }

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
      const userId = req.user.userId;

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

      // Get urgent unread count from metadata
      const [urgentResult] = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE user_id = :userId 
        AND is_read = false 
        AND metadata->>'priority' = 'urgent'
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      `, {
        replacements: { userId },
        type: QueryTypes.SELECT
      });
      
      const urgentCount = parseInt(urgentResult.count) || 0;

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
