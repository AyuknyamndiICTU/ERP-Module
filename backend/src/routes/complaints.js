const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { logger } = require('../utils/logger');
const Complaint = require('../models/Complaint');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/complaints:
 *   get:
 *     summary: Get complaints (role-based access)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, priority } = req.query;
    const userRole = req.user.role;
    
    let whereClause = {};
    
    // Students can only see their own complaints
    if (userRole === 'student') {
      const student = await Student.findOne({ where: { userId: req.user.id } });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found'
        });
      }
      whereClause.studentId = student.id;
    }
    
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;

    const complaints = await Complaint.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          attributes: ['id', 'matricule', 'firstName', 'lastName', 'email']
        },
        {
          model: Course,
          attributes: ['id', 'code', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      complaints
    });
  } catch (error) {
    logger.error('Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints'
    });
  }
});

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Create new complaint (students only)
 *     tags: [Complaints]
 */
router.post('/',
  authenticateToken,
  roleAuth(['student']),
  [
    body('courseId').isInt().withMessage('Valid course ID required'),
    body('lecturerId').isInt().withMessage('Valid lecturer ID required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('attachments').optional().isArray()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Get student profile
      const student = await Student.findOne({ where: { userId: req.user.id } });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found'
        });
      }

      const {
        courseId,
        lecturerId,
        subject,
        description,
        attachments,
        priority
      } = req.body;

      const complaint = await Complaint.create({
        studentId: student.id,
        courseId,
        lecturerId,
        subject,
        description,
        attachments: attachments || [],
        priority: priority || 'medium'
      });

      // Create notifications for lecturer and coordinators
      await Notification.create({
        recipientId: lecturerId,
        senderId: req.user.id,
        title: 'New Grade Complaint',
        message: `Student ${student.firstName} ${student.lastName} has filed a complaint about course grades.`,
        type: 'warning',
        category: 'complaint',
        isPopup: true,
        priority: complaint.priority,
        metadata: {
          complaintId: complaint.id,
          courseId: courseId
        }
      });

      logger.info(`Complaint created by student ${student.matricule} for course ${courseId}`);

      res.status(201).json({
        success: true,
        message: 'Complaint submitted successfully',
        complaint
      });
    } catch (error) {
      logger.error('Error creating complaint:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating complaint'
      });
    }
  }
);

/**
 * @swagger
 * /api/complaints/{id}/respond:
 *   post:
 *     summary: Respond to complaint
 *     tags: [Complaints]
 */
router.post('/:id/respond',
  authenticateToken,
  roleAuth(['lecturer', 'faculty_coordinator', 'major_coordinator', 'admin']),
  [
    param('id').isInt().withMessage('Valid complaint ID required'),
    body('response').notEmpty().withMessage('Response is required'),
    body('status').isIn(['under_review', 'resolved', 'rejected']).withMessage('Valid status required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { response, status } = req.body;

      const complaint = await Complaint.findByPk(id, {
        include: [{ model: Student, attributes: ['userId', 'firstName', 'lastName'] }]
      });

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found'
        });
      }

      await complaint.update({
        response,
        status,
        respondedBy: req.user.id,
        respondedAt: new Date(),
        resolvedAt: status === 'resolved' ? new Date() : null
      });

      // Notify student of response
      await Notification.create({
        recipientId: complaint.Student.userId,
        senderId: req.user.id,
        title: 'Complaint Response',
        message: `Your complaint has been ${status}. Please check the details.`,
        type: status === 'resolved' ? 'success' : 'info',
        category: 'complaint',
        isPopup: true,
        metadata: {
          complaintId: complaint.id,
          status: status
        }
      });

      logger.info(`Complaint ${id} responded to by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Response submitted successfully',
        complaint
      });
    } catch (error) {
      logger.error('Error responding to complaint:', error);
      res.status(500).json({
        success: false,
        message: 'Error responding to complaint'
      });
    }
  }
);

module.exports = router;
