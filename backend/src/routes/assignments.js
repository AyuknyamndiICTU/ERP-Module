const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { checkPermission, canAccessStudentData } = require('../middleware/rolePermissions');
const { sequelize } = require('../config/database');
const { logger } = require('../utils/logger');
const { body, param, query, validationResult } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Assignments
 *   description: Assignment management endpoints
 */

/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: Get assignments
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *         description: Filter by course ID
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *         description: Filter by student ID (for student's own assignments)
 *     responses:
 *       200:
 *         description: Assignments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { courseId, studentId } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    let whereClause = '';
    let replacements = {};

    // Role-based filtering
    if (userRole === 'student') {
      // Students can only see their own assignments
      whereClause = 'WHERE a.student_id = :userId';
      replacements.userId = userId;
    } else if (userRole === 'teacher') {
      // Teachers can see assignments for courses they teach
      whereClause = 'WHERE c.instructor_id = :userId';
      replacements.userId = userId;
    }

    // Additional filters
    if (courseId) {
      whereClause += whereClause ? ' AND a.course_id = :courseId' : 'WHERE a.course_id = :courseId';
      replacements.courseId = courseId;
    }

    if (studentId && (userRole === 'admin' || userRole === 'teacher')) {
      whereClause += whereClause ? ' AND a.student_id = :studentId' : 'WHERE a.student_id = :studentId';
      replacements.studentId = studentId;
    }

    const assignments = await sequelize.query(`
      SELECT 
        a.id,
        a.title,
        a.description,
        a.due_date,
        a.max_score,
        a.submission_status,
        a.submitted_at,
        a.score,
        c.course_name,
        c.course_code,
        u.first_name,
        u.last_name
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN users u ON a.student_id = u.id
      ${whereClause}
      ORDER BY a.due_date DESC
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    res.status(200).json({
      success: true,
      assignments,
      message: 'Assignments retrieved successfully'
    });

  } catch (error) {
    logger.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving assignments'
    });
  }
});

/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: Create new assignment
 *     tags: [Assignments]
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
 *               - title
 *               - dueDate
 *               - maxScore
 *             properties:
 *               courseId:
 *                 type: integer
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               maxScore:
 *                 type: number
 *     responses:
 *       201:
 *         description: Assignment created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, checkPermission('courses', 'create'), async (req, res) => {
  try {
    const { courseId, title, description, dueDate, maxScore } = req.body;

    if (!courseId || !title || !dueDate || !maxScore) {
      return res.status(400).json({
        success: false,
        message: 'Course ID, title, due date, and max score are required'
      });
    }

    // Verify course exists and user has permission
    const [course] = await sequelize.query(
      'SELECT id, instructor_id FROM courses WHERE id = :courseId',
      {
        replacements: { courseId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if teacher is assigned to this course
    if (req.user.role === 'teacher' && course.instructor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only create assignments for courses you teach'
      });
    }

    const [result] = await sequelize.query(`
      INSERT INTO assignments (course_id, title, description, due_date, max_score, created_by, created_at, updated_at)
      VALUES (:courseId, :title, :description, :dueDate, :maxScore, :createdBy, NOW(), NOW())
      RETURNING id, title, description, due_date, max_score, created_at
    `, {
      replacements: {
        courseId,
        title,
        description,
        dueDate,
        maxScore,
        createdBy: req.user.id
      },
      type: sequelize.QueryTypes.INSERT
    });

    res.status(201).json({
      success: true,
      assignment: result[0],
      message: 'Assignment created successfully'
    });

  } catch (error) {
    logger.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating assignment'
    });
  }
});

/**
 * @swagger
 * /api/assignments/{id}/submit:
 *   put:
 *     summary: Submit assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               submissionText:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assignment submitted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Server error
 */
router.put('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { submissionText, fileUrl } = req.body;
    const userId = req.user.id;

    if (!submissionText && !fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Submission text or file URL is required'
      });
    }

    // Check if assignment exists and user is enrolled
    const [assignment] = await sequelize.query(`
      SELECT a.id, a.due_date, e.student_id
      FROM assignments a
      JOIN enrollments e ON a.course_id = e.course_id
      WHERE a.id = :id AND e.student_id = :userId
    `, {
      replacements: { id, userId },
      type: sequelize.QueryTypes.SELECT
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or you are not enrolled in this course'
      });
    }

    // Check if due date has passed
    if (new Date() > new Date(assignment.due_date)) {
      return res.status(400).json({
        success: false,
        message: 'Assignment submission deadline has passed'
      });
    }

    await sequelize.query(`
      UPDATE assignments 
      SET submission_text = :submissionText, 
          file_url = :fileUrl, 
          submission_status = 'submitted',
          submitted_at = NOW(),
          updated_at = NOW()
      WHERE id = :id AND student_id = :userId
    `, {
      replacements: {
        id,
        userId,
        submissionText,
        fileUrl
      },
      type: sequelize.QueryTypes.UPDATE
    });

    res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully'
    });

  } catch (error) {
    logger.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting assignment'
    });
  }
});

/**
 * @swagger
 * /api/assignments/{id}/grade:
 *   put:
 *     summary: Grade assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: number
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assignment graded successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Server error
 */
router.put('/:id/grade', authenticateToken, checkPermission('grades', 'create'), async (req, res) => {
  try {
    const { id } = req.params;
    const { score, feedback } = req.body;

    if (score === undefined || score === null) {
      return res.status(400).json({
        success: false,
        message: 'Score is required'
      });
    }

    // Verify assignment exists and get max score
    const [assignment] = await sequelize.query(`
      SELECT a.id, a.max_score, c.instructor_id
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE a.id = :id
    `, {
      replacements: { id },
      type: sequelize.QueryTypes.SELECT
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if teacher is assigned to this course
    if (req.user.role === 'teacher' && assignment.instructor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only grade assignments for courses you teach'
      });
    }

    if (score > assignment.max_score) {
      return res.status(400).json({
        success: false,
        message: `Score cannot exceed maximum score of ${assignment.max_score}`
      });
    }

    await sequelize.query(`
      UPDATE assignments 
      SET score = :score, 
          feedback = :feedback,
          graded_by = :gradedBy,
          graded_at = NOW(),
          updated_at = NOW()
      WHERE id = :id
    `, {
      replacements: {
        id,
        score,
        feedback,
        gradedBy: req.user.id
      },
      type: sequelize.QueryTypes.UPDATE
    });

    res.status(200).json({
      success: true,
      message: 'Assignment graded successfully'
    });

  } catch (error) {
    logger.error('Grade assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error grading assignment'
    });
  }
});

module.exports = router;
