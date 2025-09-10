const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { logger } = require('../utils/logger');
const { body, param, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Course = require('../models/Course');

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management endpoints
 */

/**
 * @swagger
 * /api/academic/courses:
 *   get:
 *     summary: Get all courses with filtering and pagination
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of courses per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in course code or name
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, completed]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isLength({ min: 1, max: 100 }),
  query('department').optional().isLength({ min: 1, max: 100 }),
  query('status').optional().isIn(['active', 'inactive', 'completed'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      search,
      department,
      status = 'active'
    } = req.query;

    // Build WHERE conditions
    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { courseCode: { [Op.iLike]: `%${search}%` } },
        { courseName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (department) {
      whereConditions.department = { [Op.iLike]: `%${department}%` };
    }

    if (status) {
      whereConditions.status = status;
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count
    const total = await Course.count({ where: whereConditions });

    // Get courses
    const courses = await Course.findAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: offset,
      order: [['courseCode', 'ASC'], ['courseName', 'ASC']]
    });

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    };

    logger.info(`Retrieved ${courses.length} courses for user ${req.user?.userId || 'unknown'}`);

    res.json({
      success: true,
      courses,
      pagination,
      message: 'Courses retrieved successfully'
    });

  } catch (error) {
    logger.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving courses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/academic/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 course:
 *                   $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
router.get('/:id', authenticateToken, [
  param('id').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    logger.info(`Course ${id} retrieved by user ${req.user?.userId || 'unknown'}`);

    res.json({
      success: true,
      course,
      message: 'Course retrieved successfully'
    });

  } catch (error) {
    logger.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/academic/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseCode
 *               - courseName
 *               - department
 *               - credits
 *             properties:
 *               courseCode:
 *                 type: string
 *                 description: Unique course code
 *               courseName:
 *                 type: string
 *                 description: Course name
 *               description:
 *                 type: string
 *                 description: Course description
 *               credits:
 *                 type: integer
 *                 description: Course credits
 *               department:
 *                 type: string
 *                 description: Department offering the course
 *               semester:
 *                 type: integer
 *                 description: Semester (1 or 2)
 *               academicYear:
 *                 type: integer
 *                 description: Academic year
 *               maxEnrollment:
 *                 type: integer
 *                 description: Maximum enrollment capacity
 *               prerequisites:
 *                 type: array
 *                 description: Course prerequisites
 *               schedule:
 *                 type: object
 *                 description: Course schedule
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Course code already exists
 */
router.post('/', authenticateToken, roleAuth(['admin', 'lecturer', 'faculty_coordinator']), [
  body('courseCode').notEmpty().isLength({ min: 3, max: 20 }).matches(/^[A-Z0-9]+$/).withMessage('Course code must be alphanumeric uppercase'),
  body('courseName').notEmpty().isLength({ min: 5, max: 255 }).trim(),
  body('description').optional().isLength({ max: 1000 }).trim(),
  body('credits').isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('department').notEmpty().isLength({ min: 2, max: 100 }).trim(),
  body('semester').optional().isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
  body('academicYear').optional().isInt({ min: 2020, max: 2030 }).withMessage('Academic year must be between 2020 and 2030'),
  body('maxEnrollment').optional().isInt({ min: 1, max: 500 }).withMessage('Max enrollment must be between 1 and 500'),
  body('prerequisites').optional().isArray(),
  body('schedule').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      courseCode,
      courseName,
      description,
      credits,
      department,
      semester,
      academicYear,
      maxEnrollment = 30,
      prerequisites = [],
      schedule
    } = req.body;

    // Check if course code already exists
    const existingCourse = await Course.findOne({ where: { courseCode } });
    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: 'Course code already exists'
      });
    }

    // Create course
    const newCourse = await Course.create({
      courseCode,
      courseName,
      description,
      credits,
      department,
      semester,
      academicYear,
      maxEnrollment,
      prerequisites,
      schedule,
      status: 'active'
    });

    logger.info(`Course ${courseCode} created by user ${req.user?.userId || 'unknown'}`);

    res.status(201).json({
      success: true,
      course: newCourse,
      message: 'Course created successfully'
    });

  } catch (error) {
    logger.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/academic/courses/{id}:
 *   put:
 *     summary: Update course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseCode:
 *                 type: string
 *               courseName:
 *                 type: string
 *               description:
 *                 type: string
 *               credits:
 *                 type: integer
 *               department:
 *                 type: string
 *               semester:
 *                 type: integer
 *               academicYear:
 *                 type: integer
 *               maxEnrollment:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, inactive, completed]
 *               prerequisites:
 *                 type: array
 *               schedule:
 *                 type: object
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       404:
 *         description: Course not found
 *       409:
 *         description: Course code already exists
 */
router.put('/:id', authenticateToken, roleAuth(['admin', 'lecturer', 'faculty_coordinator']), [
  param('id').isUUID(),
  body('courseCode').optional().isLength({ min: 3, max: 20 }).matches(/^[A-Z0-9]+$/).withMessage('Course code must be alphanumeric uppercase'),
  body('courseName').optional().isLength({ min: 5, max: 255 }).trim(),
  body('description').optional().isLength({ max: 1000 }).trim(),
  body('credits').optional().isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('department').optional().isLength({ min: 2, max: 100 }).trim(),
  body('semester').optional().isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
  body('academicYear').optional().isInt({ min: 2020, max: 2030 }).withMessage('Academic year must be between 2020 and 2030'),
  body('maxEnrollment').optional().isInt({ min: 1, max: 500 }).withMessage('Max enrollment must be between 1 and 500'),
  body('status').optional().isIn(['active', 'inactive', 'completed']),
  body('prerequisites').optional().isArray(),
  body('schedule').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Find course
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if updating course code and if it conflicts
    if (updateData.courseCode && updateData.courseCode !== course.courseCode) {
      const existingCourse = await Course.findOne({
        where: { courseCode: updateData.courseCode, id: { [Op.ne]: id } }
      });
      if (existingCourse) {
        return res.status(409).json({
          success: false,
          message: 'Course code already exists'
        });
      }
    }

    // Update course
    await course.update(updateData);

    logger.info(`Course ${id} updated by user ${req.user?.userId || 'unknown'}`);

    res.json({
      success: true,
      course,
      message: 'Course updated successfully'
    });

  } catch (error) {
    logger.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/academic/courses/{id}:
 *   delete:
 *     summary: Delete course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       404:
 *         description: Course not found
 */
router.delete('/:id', authenticateToken, roleAuth(['admin']), [
  param('id').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    // Find course
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Delete course
    await course.destroy();

    logger.info(`Course ${id} deleted by user ${req.user?.userId || 'unknown'}`);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    logger.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
