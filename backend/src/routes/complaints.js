const express = require('express');
const router = express.Router();
const { body, validationResult, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { logger } = require('../utils/logger');
const Complaint = require('../models/Complaint');
const Student = require('../models/Student');
const Course = require('../models/Course');
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');

/**
 * @swagger
 * components:
 *   schemas:
 *     Complaint:
 *       type: object
 *       required:
 *         - studentId
 *         - courseId
 *         - lecturerId
 *         - subject
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         studentId:
 *           type: string
 *           format: uuid
 *         courseId:
 *           type: string
 *           format: uuid
 *         lecturerId:
 *           type: string
 *           format: uuid
 *         subject:
 *           type: string
 *         description:
 *           type: string
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           type: string
 *           enum: [pending, under_review, resolved, rejected]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         response:
 *           type: string
 *         respondedBy:
 *           type: string
 *           format: uuid
 *         respondedAt:
 *           type: string
 *           format: date-time
 *         resolvedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/complaints:
 *   get:
 *     summary: Get complaints with filtering
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, under_review, resolved, rejected]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of complaints
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 complaints:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Complaint'
 */
router.get('/',
  authenticateToken,
  [
    query('status').optional().isIn(['pending', 'under_review', 'resolved', 'rejected']),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    query('courseId').optional().isUUID()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status, priority, courseId } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Build WHERE conditions
      const whereConditions = {};

      if (status) whereConditions.status = status;
      if (priority) whereConditions.priority = priority;
      if (courseId) whereConditions.courseId = courseId;

      // Role-based access control
      if (userRole === 'student') {
        whereConditions.studentId = userId;
      } else if (userRole === 'lecturer') {
        whereConditions.lecturerId = userId;
      } else if (userRole.includes('coordinator')) {
        // Coordinators can see complaints from their faculty/major
        const user = await User.findByPk(userId);
        if (user.coordinatorType === 'faculty') {
          // Find courses in the faculty
          const courses = await Course.findAll({
            include: [{
              model: Faculty,
              where: { coordinatorId: userId }
            }]
          });
          const courseIds = courses.map(c => c.id);
          whereConditions.courseId = { [Op.in]: courseIds };
        }
      }

      // Get complaints with related data
      const complaints = await Complaint.findAll({
        where: whereConditions,
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['matricule', 'firstName', 'lastName', 'email']
          },
          {
            model: Course,
            as: 'course',
            attributes: ['courseCode', 'courseName']
          },
          {
            model: User,
            as: 'lecturer',
            attributes: ['firstName', 'lastName', 'email']
          },
          {
            model: User,
            as: 'responder',
            attributes: ['firstName', 'lastName', 'email'],
            required: false
          }
        ],
        order: [
          ['priority', 'DESC'],
          ['createdAt', 'DESC']
        ]
      });

      logger.info(`Retrieved ${complaints.length} complaints for user ${userId}`);

      res.json({
        complaints,
        filters: {
          status,
          priority,
          courseId
        }
      });

    } catch (error) {
      logger.error('Error fetching complaints:', error);
      res.status(500).json({
        message: 'Error fetching complaints',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Submit a new complaint (Student only)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - lecturerId
 *               - subject
 *               - description
 *             properties:
 *               courseId:
 *                 type: string
 *                 format: uuid
 *               lecturerId:
 *                 type: string
 *                 format: uuid
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *     responses:
 *       201:
 *         description: Complaint submitted successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized to submit complaints
 */
router.post('/',
  authenticateToken,
  roleAuth(['student']),
  [
    body('courseId').isUUID().withMessage('Valid course ID is required'),
    body('lecturerId').isUUID().withMessage('Valid lecturer ID is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('attachments').optional().isArray(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const studentId = req.user.id;
      const {
        courseId,
        lecturerId,
        subject,
        description,
        attachments = [],
        priority = 'medium'
      } = req.body;

      // Verify that the student is enrolled in the course
      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Verify the course exists and lecturer is assigned
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Create complaint
      const complaint = await Complaint.create({
        studentId,
        courseId,
        lecturerId,
        subject,
        description,
        attachments,
        priority,
        status: 'pending'
      });

      // Create notifications for lecturer and coordinator
      const lecturer = await User.findByPk(lecturerId);
      if (lecturer) {
        await Notification.create({
          recipientId: lecturerId,
          senderId: studentId,
          title: 'New Student Complaint',
          message: `A new complaint has been submitted regarding ${course.courseName}: ${subject}`,
          type: 'warning',
          category: 'complaint',
          isPopup: true,
          priority: priority === 'urgent' ? 'urgent' : 'high',
          metadata: {
            complaintId: complaint.id,
            courseId: courseId,
            studentId: studentId
          }
        });
      }

      // Notify faculty coordinator
      const faculty = await Faculty.findByPk(course.facultyId);
      if (faculty && faculty.coordinatorId) {
        await Notification.create({
          recipientId: faculty.coordinatorId,
          senderId: studentId,
          title: 'New Student Complaint',
          message: `A new complaint has been submitted in ${faculty.name}: ${subject}`,
          type: 'warning',
          category: 'complaint',
          isPopup: true,
          priority: priority === 'urgent' ? 'urgent' : 'high',
          metadata: {
            complaintId: complaint.id,
            courseId: courseId,
            studentId: studentId
          }
        });
      }

      logger.info(`Complaint submitted by student ${studentId} for course ${courseId}`);

      res.status(201).json({
        message: 'Complaint submitted successfully. You will be notified when there is a response.',
        complaint: {
          id: complaint.id,
          subject: complaint.subject,
          status: complaint.status,
          priority: complaint.priority,
          createdAt: complaint.createdAt
        }
      });

    } catch (error) {
      logger.error('Error submitting complaint:', error);
      res.status(500).json({
        message: 'Error submitting complaint',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/complaints/{id}/respond:
 *   post:
 *     summary: Respond to a complaint (Lecturer/Coordinator only)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - response
 *               - status
 *             properties:
 *               response:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [under_review, resolved, rejected]
 *     responses:
 *       200:
 *         description: Complaint responded to successfully
 *       403:
 *         description: Not authorized to respond to this complaint
 *       404:
 *         description: Complaint not found
 */
router.post('/:id/respond',
  authenticateToken,
  roleAuth(['lecturer', 'faculty_coordinator', 'major_coordinator']),
  [
    param('id').isUUID(),
    body('response').notEmpty().withMessage('Response is required'),
    body('status').isIn(['under_review', 'resolved', 'rejected']).withMessage('Valid status is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const userId = req.user.id;
      const { response, status } = req.body;

      // Find complaint
      const complaint = await Complaint.findByPk(id);
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      // Check permissions
      if (req.user.role === 'lecturer' && complaint.lecturerId !== userId) {
        return res.status(403).json({
          message: 'You are not authorized to respond to this complaint'
        });
      }

      // For coordinators, check if they have permission for the course's faculty
      if (req.user.role.includes('coordinator')) {
        const course = await Course.findByPk(complaint.courseId);
        if (course) {
          const faculty = await Faculty.findByPk(course.facultyId);
          if (!faculty || faculty.coordinatorId !== userId) {
            return res.status(403).json({
              message: 'You are not authorized to respond to complaints for this faculty'
            });
          }
        }
      }

      // Update complaint
      const updateData = {
        response,
        status,
        respondedBy: userId,
        respondedAt: new Date()
      };

      if (status === 'resolved' || status === 'rejected') {
        updateData.resolvedAt = new Date();
      }

      await complaint.update(updateData);

      // Create notification for student
      await Notification.create({
        recipientId: complaint.studentId,
        senderId: userId,
        title: `Complaint ${status === 'resolved' ? 'Resolved' : status === 'rejected' ? 'Rejected' : 'Updated'}`,
        message: `Your complaint regarding "${complaint.subject}" has been ${status}. ${response}`,
        type: status === 'resolved' ? 'success' : status === 'rejected' ? 'error' : 'info',
        category: 'complaint',
        isPopup: true,
        priority: 'medium',
        metadata: {
          complaintId: complaint.id,
          status: status
        }
      });

      logger.info(`Complaint ${id} responded to by user ${userId} with status ${status}`);

      res.json({
        message: 'Complaint responded to successfully',
        complaint: {
          id: complaint.id,
          status: complaint.status,
          response: complaint.response,
          respondedAt: complaint.respondedAt,
          resolvedAt: complaint.resolvedAt
        }
      });

    } catch (error) {
      logger.error('Error responding to complaint:', error);
      res.status(500).json({
        message: 'Error responding to complaint',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/complaints/{id}:
 *   get:
 *     summary: Get complaint details
 *     tags: [Complaints]
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
 *         description: Complaint details
 *       403:
 *         description: Not authorized to view this complaint
 *       404:
 *         description: Complaint not found
 */
router.get('/:id',
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
      const userRole = req.user.role;

      // Find complaint with related data
      const complaint = await Complaint.findByPk(id, {
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['matricule', 'firstName', 'lastName', 'email']
          },
          {
            model: Course,
            as: 'course',
            attributes: ['courseCode', 'courseName', 'description']
          },
          {
            model: User,
            as: 'lecturer',
            attributes: ['firstName', 'lastName', 'email']
          },
          {
            model: User,
            as: 'responder',
            attributes: ['firstName', 'lastName', 'email'],
            required: false
          }
        ]
      });

      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      // Check permissions
      if (userRole === 'student' && complaint.studentId !== userId) {
        return res.status(403).json({
          message: 'You are not authorized to view this complaint'
        });
      }

      if (userRole === 'lecturer' && complaint.lecturerId !== userId) {
        // Check if lecturer is coordinator for the course's faculty
        const course = await Course.findByPk(complaint.courseId);
        if (course) {
          const faculty = await Faculty.findByPk(course.facultyId);
          if (!faculty || faculty.coordinatorId !== userId) {
            return res.status(403).json({
              message: 'You are not authorized to view this complaint'
            });
          }
        }
      }

      logger.info(`Complaint ${id} viewed by user ${userId}`);

      res.json({ complaint });

    } catch (error) {
      logger.error('Error fetching complaint:', error);
      res.status(500).json({
        message: 'Error fetching complaint',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/complaints/{id}:
 *   put:
 *     summary: Update complaint (Student only - for editing pending complaints)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 *       403:
 *         description: Not authorized to update this complaint
 *       404:
 *         description: Complaint not found
 */
router.put('/:id',
  authenticateToken,
  roleAuth(['student']),
  [
    param('id').isUUID(),
    body('subject').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('attachments').optional().isArray(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const studentId = req.user.id;
      const updateData = req.body;

      // Find complaint
      const complaint = await Complaint.findByPk(id);
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      // Check permissions
      if (complaint.studentId !== studentId) {
        return res.status(403).json({
          message: 'You are not authorized to update this complaint'
        });
      }

      // Only allow updates for pending complaints
      if (complaint.status !== 'pending') {
        return res.status(400).json({
          message: 'Cannot update complaint that is already being processed'
        });
      }

      // Update complaint
      await complaint.update(updateData);

      logger.info(`Complaint ${id} updated by student ${studentId}`);

      res.json({
        message: 'Complaint updated successfully',
        complaint: {
          id: complaint.id,
          subject: complaint.subject,
          description: complaint.description,
          priority: complaint.priority,
          updatedAt: complaint.updatedAt
        }
      });

    } catch (error) {
      logger.error('Error updating complaint:', error);
      res.status(500).json({
        message: 'Error updating complaint',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
