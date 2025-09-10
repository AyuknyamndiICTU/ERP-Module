const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');

// Import models
const Course = require('../models/Course');
const Student = require('../models/Student');
const Grade = require('../models/Grade');
const User = require('../models/User');
const Department = require('../models/Department');
const Major = require('../models/Major');
const Faculty = require('../models/Faculty');
const Enrollment = require('../models/Enrollment');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');

/**
 * @swagger
 * tags:
 *   name: Academic
 *   description: Academic module endpoints for course management, student records, grades, and attendance
 */

// Course Management Routes
/**
 * @swagger
 * /api/academic/courses:
 *   get:
 *     summary: Get all courses with filtering and pagination
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.get('/courses',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('departmentId').optional().isInt(),
    query('semester').optional().isInt({ min: 1, max: 2 }),
    query('year').optional().isInt({ min: 1, max: 4 }),
    query('search').optional().isLength({ min: 1, max: 100 })
  ],
  async (req, res) => {
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
        departmentId,
        semester,
        year,
        search,
        status = 'active'
      } = req.query;

      // Build WHERE conditions
      const whereConditions = {};

      if (search) {
        whereConditions[Op.or] = [
          { courseCode: { [Op.iLike]: `%${search}%` } },
          { courseName: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Note: courses table doesn't have departmentId, semester, or year fields
      // These filters would need to be implemented differently if required

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

      logger.info(`Retrieved ${courses.length} courses for user ${req.user.userId}`);

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
  }
);

/**
 * @swagger
 * /api/academic/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.post('/courses',
  authenticateToken,
  roleAuth(['admin', 'lecturer', 'faculty_coordinator', 'major_coordinator']),
  [
    body('code').notEmpty().isLength({ min: 3, max: 20 }).matches(/^[A-Z0-9]+$/).withMessage('Course code must be alphanumeric uppercase'),
    body('name').notEmpty().isLength({ min: 5, max: 255 }).trim(),
    body('description').optional().isLength({ max: 1000 }).trim(),
    body('credits').isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
    body('departmentId').isInt().withMessage('Valid department ID required'),
    body('majorId').optional().isInt(),
    body('lecturerId').optional().isInt(),
    body('semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
    body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
    body('prerequisites').optional().isArray(),
    body('schedule').optional().isObject()
  ],
  async (req, res) => {
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
        level,
        prerequisites = [],
        corequisites = [],
        learningOutcomes,
        syllabusUrl
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
        level,
        prerequisites,
        corequisites,
        learningOutcomes,
        syllabusUrl,
        isActive: true
      });

      logger.info(`Course ${code} created by user ${req.user.userId}`);

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
  }
);

/**
 * @swagger
 * /api/academic/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.get('/courses/:id',
  authenticateToken,
  [param('id').isInt()],
  async (req, res) => {
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

      logger.info(`Course ${id} retrieved by user ${req.user.userId}`);

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
  }
);

/**
 * @swagger
 * /api/academic/courses/{id}:
 *   put:
 *     summary: Update course
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.put('/courses/:id',
  authenticateToken,
  roleAuth(['admin', 'lecturer', 'faculty_coordinator', 'major_coordinator']),
  [
    param('id').isInt(),
    body('code').optional().isLength({ min: 3, max: 20 }).matches(/^[A-Z0-9]+$/).withMessage('Course code must be alphanumeric uppercase'),
    body('name').optional().isLength({ min: 5, max: 255 }).trim(),
    body('description').optional().isLength({ max: 1000 }).trim(),
    body('credits').optional().isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
    body('departmentId').optional().isInt().withMessage('Valid department ID required'),
    body('majorId').optional().isInt(),
    body('lecturerId').optional().isInt(),
    body('semester').optional().isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
    body('year').optional().isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
    body('prerequisites').optional().isArray(),
    body('schedule').optional().isObject(),
    body('status').optional().isIn(['active', 'inactive'])
  ],
  async (req, res) => {
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

      logger.info(`Course ${id} updated by user ${req.user.userId}`);

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
  }
);

/**
 * @swagger
 * /api/academic/courses/{id}:
 *   delete:
 *     summary: Delete course
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/courses/:id',
  authenticateToken,
  roleAuth(['admin', 'faculty_coordinator']),
  [param('id').isInt()],
  async (req, res) => {
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

      // Check if course has enrollments (soft delete consideration)
      // For now, we'll allow deletion but in production you might want to soft delete

      // Delete course
      await course.destroy();

      logger.info(`Course ${id} deleted by user ${req.user.userId}`);

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
  }
);

// Student Management Routes
/**
 * @swagger
 * /api/academic/students:
 *   get:
 *     summary: Get all students with filtering and pagination
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.get('/students',
  authenticateToken,
  roleAuth(['admin', 'lecturer', 'faculty_coordinator', 'major_coordinator']),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('facultyId').optional().isInt(),
    query('departmentId').optional().isInt(),
    query('majorId').optional().isInt(),
    query('level').optional().isInt({ min: 1, max: 4 }),
    query('status').optional().isIn(['active', 'inactive', 'graduated', 'suspended']),
    query('search').optional().isLength({ min: 1, max: 100 })
  ],
  async (req, res) => {
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
        facultyId,
        departmentId,
        majorId,
        level,
        status = 'active',
        search
      } = req.query;

      // Build WHERE conditions
      const whereConditions = { status };

      if (search) {
        whereConditions[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { matricule: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (facultyId) whereConditions.facultyId = facultyId;
      if (departmentId) whereConditions.departmentId = departmentId;
      if (majorId) whereConditions.majorId = majorId;
      if (level) whereConditions.level = level;

      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count
      const total = await Student.count({ where: whereConditions });

      // Get students
      const students = await Student.findAll({
        where: whereConditions,
        limit: parseInt(limit),
        offset: offset,
        order: [['lastName', 'ASC'], ['firstName', 'ASC']]
      });

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      };

      logger.info(`Retrieved ${students.length} students for user ${req.user.userId}`);

      res.json({
        success: true,
        students,
        pagination,
        message: 'Students retrieved successfully'
      });

    } catch (error) {
      logger.error('Get students error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error retrieving students',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Enrollment Management Routes
/**
 * @swagger
 * /api/academic/enrollments:
 *   get:
 *     summary: Get enrollments with filtering
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.get('/enrollments',
  authenticateToken,
  [
    query('studentId').optional().isInt(),
    query('courseId').optional().isInt(),
    query('semester').optional().isInt({ min: 1, max: 2 }),
    query('academicYear').optional().isLength({ min: 4, max: 10 }),
    query('status').optional().isIn(['enrolled', 'withdrawn', 'completed', 'failed']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  async (req, res) => {
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
        studentId,
        courseId,
        semester,
        academicYear,
        status,
        page = 1,
        limit = 10
      } = req.query;

      // Build WHERE conditions
      const whereConditions = {};

      if (studentId) whereConditions.studentId = studentId;
      if (courseId) whereConditions.courseId = courseId;
      if (semester) whereConditions.semester = semester;
      if (academicYear) whereConditions.academicYear = academicYear;
      if (status) whereConditions.status = status;

      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count
      const total = await Enrollment.count({ where: whereConditions });

      // Get enrollments with associations
      const enrollments = await Enrollment.findAll({
        where: whereConditions,
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'matricule', 'firstName', 'lastName', 'email']
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'code', 'name', 'credits']
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [['createdAt', 'DESC']]
      });

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      };

      logger.info(`Retrieved ${enrollments.length} enrollments for user ${req.user.userId}`);

      res.json({
        success: true,
        enrollments,
        pagination,
        message: 'Enrollments retrieved successfully'
      });

    } catch (error) {
      logger.error('Get enrollments error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error retrieving enrollments',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/academic/enrollments:
 *   post:
 *     summary: Enroll student in course
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.post('/enrollments',
  authenticateToken,
  roleAuth(['admin', 'lecturer', 'faculty_coordinator', 'major_coordinator']),
  [
    body('studentId').isInt().withMessage('Valid student ID required'),
    body('courseId').isInt().withMessage('Valid course ID required'),
    body('semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
    body('academicYear').notEmpty().withMessage('Academic year required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { studentId, courseId, semester, academicYear } = req.body;

      // Verify student exists
      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Verify course exists
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check if student is already enrolled in this course
      const existingEnrollment = await Enrollment.findOne({
        where: { studentId, courseId, semester, academicYear }
      });

      if (existingEnrollment) {
        return res.status(409).json({
          success: false,
          message: 'Student is already enrolled in this course for the specified period'
        });
      }

      // Create enrollment
      const enrollment = await Enrollment.create({
        studentId,
        courseId,
        semester,
        academicYear,
        status: 'enrolled',
        enrollmentDate: new Date()
      });

      logger.info(`Student ${studentId} enrolled in course ${courseId} by user ${req.user.userId}`);

      res.status(201).json({
        success: true,
        enrollment,
        message: 'Student enrolled successfully'
      });

    } catch (error) {
      logger.error('Create enrollment error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error creating enrollment',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/academic/enrollments/{id}:
 *   put:
 *     summary: Update enrollment
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.put('/enrollments/:id',
  authenticateToken,
  roleAuth(['admin', 'lecturer', 'faculty_coordinator', 'major_coordinator']),
  [
    param('id').isInt(),
    body('status').optional().isIn(['enrolled', 'withdrawn', 'completed', 'failed']),
    body('withdrawalReason').optional().isLength({ max: 500 }),
    body('finalGrade').optional().isLength({ min: 1, max: 5 })
  ],
  async (req, res) => {
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
      const { status, withdrawalReason, finalGrade } = req.body;

      // Find enrollment
      const enrollment = await Enrollment.findByPk(id, {
        include: [
          { model: Student, as: 'student' },
          { model: Course, as: 'course' }
        ]
      });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      // Update enrollment
      const updateData = {};
      if (status) {
        updateData.status = status;
        if (status === 'withdrawn') {
          updateData.withdrawalDate = new Date();
          updateData.withdrawalReason = withdrawalReason;
        }
      }
      if (finalGrade) updateData.finalGrade = finalGrade;

      await enrollment.update(updateData);

      logger.info(`Enrollment ${id} updated by user ${req.user.userId}`);

      res.json({
        success: true,
        enrollment,
        message: 'Enrollment updated successfully'
      });

    } catch (error) {
      logger.error('Update enrollment error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating enrollment',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/academic/enrollments/{id}:
 *   delete:
 *     summary: Delete enrollment
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/enrollments/:id',
  authenticateToken,
  roleAuth(['admin', 'faculty_coordinator']),
  [param('id').isInt()],
  async (req, res) => {
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

      // Find enrollment
      const enrollment = await Enrollment.findByPk(id);
      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      // Delete enrollment
      await enrollment.destroy();

      logger.info(`Enrollment ${id} deleted by user ${req.user.userId}`);

      res.json({
        success: true,
        message: 'Enrollment deleted successfully'
      });

    } catch (error) {
      logger.error('Delete enrollment error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error deleting enrollment',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Grade Management Routes
/**
 * @swagger
 * /api/academic/grades:
 *   get:
 *     summary: Get grades with filtering
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.get('/grades',
  authenticateToken,
  [
    query('studentId').optional().isInt(),
    query('courseId').optional().isInt(),
    query('semester').optional().isInt({ min: 1, max: 2 }),
    query('academicYear').optional().isLength({ min: 4, max: 10 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  async (req, res) => {
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
        studentId,
        courseId,
        semester,
        academicYear,
        page = 1,
        limit = 10
      } = req.query;

      // Build WHERE conditions
      const whereConditions = {};

      if (studentId) whereConditions.studentId = studentId;
      if (courseId) whereConditions.courseId = courseId;
      if (semester) whereConditions.semester = semester;
      if (academicYear) whereConditions.academicYear = academicYear;

      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count
      const total = await Grade.count({ where: whereConditions });

      // Get grades
      const grades = await Grade.findAll({
        where: whereConditions,
        limit: parseInt(limit),
        offset: offset,
        order: [['createdAt', 'DESC']]
      });

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      };

      logger.info(`Retrieved ${grades.length} grades for user ${req.user.userId}`);

      res.json({
        success: true,
        grades,
        pagination,
        message: 'Grades retrieved successfully'
      });

    } catch (error) {
      logger.error('Get grades error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error retrieving grades',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/academic/grades:
 *   post:
 *     summary: Record grade
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.post('/grades',
  authenticateToken,
  roleAuth(['admin', 'lecturer', 'faculty_coordinator', 'major_coordinator']),
  [
    body('studentId').isInt().withMessage('Valid student ID required'),
    body('courseId').isInt().withMessage('Valid course ID required'),
    body('semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
    body('academicYear').notEmpty().withMessage('Academic year required'),
    body('caMarks').optional().isFloat({ min: 0, max: 40 }).withMessage('CA marks must be between 0 and 40'),
    body('examMarks').optional().isFloat({ min: 0, max: 60 }).withMessage('Exam marks must be between 0 and 60'),
    body('totalMarks').optional().isFloat({ min: 0, max: 100 }).withMessage('Total marks must be between 0 and 100')
  ],
  async (req, res) => {
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
        studentId,
        courseId,
        semester,
        academicYear,
        caMarks = 0,
        examMarks = 0,
        totalMarks
      } = req.body;

      // Verify student exists
      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Verify course exists
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Calculate total marks if not provided
      const calculatedTotalMarks = totalMarks || (caMarks + examMarks);

      // Calculate letter grade and grade points
      let letterGrade = 'F';
      let gradePoints = 0;

      if (calculatedTotalMarks >= 80) {
        letterGrade = 'A';
        gradePoints = 4.0;
      } else if (calculatedTotalMarks >= 70) {
        letterGrade = 'B';
        gradePoints = 3.0;
      } else if (calculatedTotalMarks >= 60) {
        letterGrade = 'C';
        gradePoints = 2.0;
      } else if (calculatedTotalMarks >= 50) {
        letterGrade = 'D';
        gradePoints = 1.0;
      }

      // Check if grade already exists
      const existingGrade = await Grade.findOne({
        where: { studentId, courseId, semester, academicYear }
      });

      let grade;
      if (existingGrade) {
        // Update existing grade
        await existingGrade.update({
          caMarks,
          examMarks,
          totalMarks: calculatedTotalMarks,
          letterGrade,
          gradePoints,
          status: 'published',
          publishedBy: req.user.userId,
          publishedAt: new Date()
        });
        grade = existingGrade;
      } else {
        // Create new grade
        grade = await Grade.create({
          studentId,
          courseId,
          lecturerId: req.user.userId,
          semester,
          academicYear,
          caMarks,
          examMarks,
          totalMarks: calculatedTotalMarks,
          letterGrade,
          gradePoints,
          status: 'published',
          publishedBy: req.user.userId,
          publishedAt: new Date()
        });
      }

      logger.info(`Grade recorded for student ${studentId} in course ${courseId} by user ${req.user.userId}`);

      res.status(201).json({
        success: true,
        grade,
        message: 'Grade recorded successfully'
      });

    } catch (error) {
      logger.error('Record grade error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error recording grade',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Reports Routes
/**
 * @swagger
 * /api/academic/reports/transcripts/{studentId}:
 *   get:
 *     summary: Generate student transcript
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.get('/reports/transcripts/:studentId',
  authenticateToken,
  roleAuth(['admin', 'lecturer', 'faculty_coordinator', 'major_coordinator', 'student']),
  [param('studentId').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { studentId } = req.params;

      // Check if user can access this transcript
      if (req.user.role === 'student' && req.user.studentId !== parseInt(studentId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own transcript.'
        });
      }

      // Get student information
      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Get all grades for the student
      const grades = await Grade.findAll({
        where: { studentId },
        order: [['academicYear', 'ASC'], ['semester', 'ASC']]
      });

      // Calculate GPA and other statistics
      let totalGradePoints = 0;
      let totalCredits = 0;
      const semesterGPAs = {};

      grades.forEach(grade => {
        const key = `${grade.academicYear}-${grade.semester}`;
        if (!semesterGPAs[key]) {
          semesterGPAs[key] = { totalPoints: 0, totalCredits: 0, courses: [] };
        }

        // Assuming 3 credits per course (should be fetched from course)
        const credits = 3;
        totalGradePoints += grade.gradePoints * credits;
        totalCredits += credits;

        semesterGPAs[key].totalPoints += grade.gradePoints * credits;
        semesterGPAs[key].totalCredits += credits;
        semesterGPAs[key].courses.push(grade);
      });

      const cumulativeGPA = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

      const transcript = {
        student: {
          id: student.id,
          matricule: student.matricule,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          facultyId: student.facultyId,
          departmentId: student.departmentId,
          majorId: student.majorId,
          level: student.level,
          status: student.status
        },
        academicRecord: {
          cumulativeGPA,
          totalCredits,
          grades,
          semesterGPAs: Object.keys(semesterGPAs).map(key => ({
            period: key,
            gpa: (semesterGPAs[key].totalPoints / semesterGPAs[key].totalCredits).toFixed(2),
            credits: semesterGPAs[key].totalCredits,
            courses: semesterGPAs[key].courses
          }))
        },
        generatedAt: new Date(),
        generatedBy: req.user.userId
      };

      logger.info(`Transcript generated for student ${studentId} by user ${req.user.userId}`);

      res.json({
        success: true,
        transcript,
        message: 'Transcript generated successfully'
      });

    } catch (error) {
      logger.error('Generate transcript error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error generating transcript',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Attendance Management Routes
/**
 * @swagger
 * /api/academic/attendance:
 *   get:
 *     summary: Get attendance records with filtering
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.get('/attendance',
  authenticateToken,
  [
    query('studentId').optional().isInt(),
    query('courseId').optional().isInt(),
    query('lecturerId').optional().isInt(),
    query('attendanceDate').optional().isISO8601(),
    query('semester').optional().isInt({ min: 1, max: 2 }),
    query('academicYear').optional().isLength({ min: 4, max: 10 }),
    query('status').optional().isIn(['present', 'absent', 'late', 'excused']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  async (req, res) => {
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
        studentId,
        courseId,
        lecturerId,
        attendanceDate,
        semester,
        academicYear,
        status,
        page = 1,
        limit = 10
      } = req.query;

      // Build WHERE conditions
      const whereConditions = { isActive: true };

      if (studentId) whereConditions.studentId = studentId;
      if (courseId) whereConditions.courseId = courseId;
      if (lecturerId) whereConditions.lecturerId = lecturerId;
      if (attendanceDate) whereConditions.attendanceDate = attendanceDate;
      if (semester) whereConditions.semester = semester;
      if (academicYear) whereConditions.academicYear = academicYear;
      if (status) whereConditions.status = status;

      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count
      const total = await Attendance.count({ where: whereConditions });

      // Get attendance records with associations
      const attendanceRecords = await Attendance.findAll({
        where: whereConditions,
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'matricule', 'firstName', 'lastName', 'email']
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'code', 'name']
          },
          {
            model: User,
            as: 'lecturer',
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [['attendanceDate', 'DESC'], ['createdAt', 'DESC']]
      });

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      };

      logger.info(`Retrieved ${attendanceRecords.length} attendance records for user ${req.user.userId}`);

      res.json({
        success: true,
        attendance: attendanceRecords,
        pagination,
        message: 'Attendance records retrieved successfully'
      });

    } catch (error) {
      logger.error('Get attendance error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error retrieving attendance records',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/academic/attendance:
 *   post:
 *     summary: Mark attendance for student
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.post('/attendance',
  authenticateToken,
  roleAuth(['admin', 'lecturer', 'faculty_coordinator', 'major_coordinator']),
  [
    body('studentId').isInt().withMessage('Valid student ID required'),
    body('courseId').isInt().withMessage('Valid course ID required'),
    body('attendanceDate').isISO8601().withMessage('Valid attendance date required'),
    body('status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Valid status required'),
    body('semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
    body('academicYear').notEmpty().withMessage('Academic year required'),
    body('checkInTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('checkOutTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('notes').optional().isLength({ max: 500 }),
    body('location').optional().isLength({ max: 100 })
  ],
  async (req, res) => {
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
        studentId,
        courseId,
        attendanceDate,
        status,
        semester,
        academicYear,
        checkInTime,
        checkOutTime,
        notes,
        location
      } = req.body;

      // Verify student exists
      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Verify course exists
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Check if attendance already exists for this student, course, and date
      const existingAttendance = await Attendance.findOne({
        where: { studentId, courseId, attendanceDate }
      });

      if (existingAttendance) {
        return res.status(409).json({
          success: false,
          message: 'Attendance already marked for this student on this date'
        });
      }

      // Calculate duration if both check-in and check-out times are provided
      let duration = null;
      if (checkInTime && checkOutTime) {
        const checkIn = new Date(`1970-01-01T${checkInTime}:00`);
        const checkOut = new Date(`1970-01-01T${checkOutTime}:00`);
        duration = Math.round((checkOut - checkIn) / (1000 * 60)); // Duration in minutes
      }

      // Create attendance record
      const attendance = await Attendance.create({
        studentId,
        courseId,
        lecturerId: req.user.userId,
        attendanceDate,
        status,
        checkInTime,
        checkOutTime,
        duration,
        notes,
        location,
        semester,
        academicYear,
        markedBy: req.user.userId
      });

      logger.info(`Attendance marked for student ${studentId} in course ${courseId} by user ${req.user.userId}`);

      res.status(201).json({
        success: true,
        attendance,
        message: 'Attendance marked successfully'
      });

    } catch (error) {
      logger.error('Mark attendance error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error marking attendance',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/academic/attendance/{id}:
 *   put:
 *     summary: Update attendance record
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.put('/attendance/:id',
  authenticateToken,
  roleAuth(['admin', 'lecturer', 'faculty_coordinator', 'major_coordinator']),
  [
    param('id').isInt(),
    body('status').optional().isIn(['present', 'absent', 'late', 'excused']),
    body('checkInTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('checkOutTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('notes').optional().isLength({ max: 500 }),
    body('location').optional().isLength({ max: 100 }),
    body('isExcused').optional().isBoolean(),
    body('excuseReason').optional().isLength({ max: 500 })
  ],
  async (req, res) => {
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
      const {
        status,
        checkInTime,
        checkOutTime,
        notes,
        location,
        isExcused,
        excuseReason
      } = req.body;

      // Find attendance record
      const attendance = await Attendance.findByPk(id);
      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      // Calculate duration if both check-in and check-out times are provided
      let duration = attendance.duration;
      if (checkInTime && checkOutTime) {
        const checkIn = new Date(`1970-01-01T${checkInTime}:00`);
        const checkOut = new Date(`1970-01-01T${checkOutTime}:00`);
        duration = Math.round((checkOut - checkIn) / (1000 * 60)); // Duration in minutes
      }

      // Update attendance record
      const updateData = {};
      if (status) updateData.status = status;
      if (checkInTime) updateData.checkInTime = checkInTime;
      if (checkOutTime) updateData.checkOutTime = checkOutTime;
      if (duration !== null) updateData.duration = duration;
      if (notes !== undefined) updateData.notes = notes;
      if (location !== undefined) updateData.location = location;
      if (isExcused !== undefined) updateData.isExcused = isExcused;
      if (excuseReason !== undefined) updateData.excuseReason = excuseReason;

      await attendance.update(updateData);

      logger.info(`Attendance record ${id} updated by user ${req.user.userId}`);

      res.json({
        success: true,
        attendance,
        message: 'Attendance record updated successfully'
      });

    } catch (error) {
      logger.error('Update attendance error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating attendance record',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/academic/attendance/{id}:
 *   delete:
 *     summary: Delete attendance record
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/attendance/:id',
  authenticateToken,
  roleAuth(['admin', 'lecturer', 'faculty_coordinator']),
  [param('id').isInt()],
  async (req, res) => {
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

      // Find attendance record
      const attendance = await Attendance.findByPk(id);
      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found'
        });
      }

      // Delete attendance record
      await attendance.destroy();

      logger.info(`Attendance record ${id} deleted by user ${req.user.userId}`);

      res.json({
        success: true,
        message: 'Attendance record deleted successfully'
      });

    } catch (error) {
      logger.error('Delete attendance error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error deleting attendance record',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/academic/attendance/bulk:
 *   post:
 *     summary: Mark attendance for multiple students
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.post('/attendance/bulk',
  authenticateToken,
  roleAuth(['admin', 'lecturer', 'faculty_coordinator', 'major_coordinator']),
  [
    body('courseId').isInt().withMessage('Valid course ID required'),
    body('attendanceDate').isISO8601().withMessage('Valid attendance date required'),
    body('semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
    body('academicYear').notEmpty().withMessage('Academic year required'),
    body('attendanceRecords').isArray().withMessage('Attendance records array required'),
    body('attendanceRecords.*.studentId').isInt().withMessage('Valid student ID required for each record'),
    body('attendanceRecords.*.status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Valid status required for each record')
  ],
  async (req, res) => {
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
        courseId,
        attendanceDate,
        semester,
        academicYear,
        attendanceRecords
      } = req.body;

      // Verify course exists
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const results = [];
      const failedRecords = [];

      // Process each attendance record
      for (const record of attendanceRecords) {
        try {
          const { studentId, status, checkInTime, checkOutTime, notes, location } = record;

          // Verify student exists
          const student = await Student.findByPk(studentId);
          if (!student) {
            failedRecords.push({ studentId, error: 'Student not found' });
            continue;
          }

          // Check if attendance already exists
          const existingAttendance = await Attendance.findOne({
            where: { studentId, courseId, attendanceDate }
          });

          if (existingAttendance) {
            // Update existing record
            await existingAttendance.update({
              status,
              checkInTime,
              checkOutTime,
              notes,
              location,
              markedBy: req.user.userId
            });
            results.push({ studentId, action: 'updated', attendance: existingAttendance });
          } else {
            // Create new record
            const attendance = await Attendance.create({
              studentId,
              courseId,
              lecturerId: req.user.userId,
              attendanceDate,
              status,
              checkInTime,
              checkOutTime,
              notes,
              location,
              semester,
              academicYear,
              markedBy: req.user.userId
            });
            results.push({ studentId, action: 'created', attendance });
          }
        } catch (error) {
          failedRecords.push({ studentId: record.studentId, error: error.message });
        }
      }

      logger.info(`Bulk attendance processed for course ${courseId} by user ${req.user.userId}: ${results.length} successful, ${failedRecords.length} errors`);

      res.status(200).json({
        success: true,
        results,
        errors: failedRecords,
        summary: {
          processed: attendanceRecords.length,
          successful: results.length,
          failed: failedRecords.length
        },
        message: `Bulk attendance processed: ${results.length} successful, ${failedRecords.length} failed`
      });

    } catch (error) {
      logger.error('Bulk attendance error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error processing bulk attendance',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/academic/attendance/reports/summary:
 *   get:
 *     summary: Get attendance summary report
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.get('/attendance/reports/summary',
  authenticateToken,
  [
    query('courseId').optional().isInt(),
    query('studentId').optional().isInt(),
    query('semester').optional().isInt({ min: 1, max: 2 }),
    query('academicYear').optional().isLength({ min: 4, max: 10 }),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  async (req, res) => {
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
        courseId,
        studentId,
        semester,
        academicYear,
        startDate,
        endDate
      } = req.query;

      // Build WHERE conditions
      const whereConditions = {};

      if (courseId) whereConditions.courseId = courseId;
      if (studentId) whereConditions.studentId = studentId;
      if (semester) whereConditions.semester = semester;
      if (academicYear) whereConditions.academicYear = academicYear;

      if (startDate && endDate) {
        whereConditions.attendanceDate = {
          [Op.between]: [startDate, endDate]
        };
      } else if (startDate) {
        whereConditions.attendanceDate = {
          [Op.gte]: startDate
        };
      } else if (endDate) {
        whereConditions.attendanceDate = {
          [Op.lte]: endDate
        };
      }

      // Get attendance statistics
      const attendanceStats = await Attendance.findAll({
        where: whereConditions,
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      // Get total records
      const totalRecords = await Attendance.count({ where: whereConditions });

      // Calculate percentages
      const summary = {
        totalRecords,
        breakdown: {},
        percentages: {}
      };

      attendanceStats.forEach(stat => {
        const count = parseInt(stat.dataValues.count);
        summary.breakdown[stat.status] = count;
        summary.percentages[stat.status] = totalRecords > 0 ? ((count / totalRecords) * 100).toFixed(2) : 0;
      });

      logger.info(`Attendance summary generated for user ${req.user.userId}`);

      res.json({
        success: true,
        summary,
        filters: {
          courseId,
          studentId,
          semester,
          academicYear,
          startDate,
          endDate
        },
        message: 'Attendance summary generated successfully'
      });

    } catch (error) {
      logger.error('Attendance summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error generating attendance summary',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Exam Management Routes
/**
 * @swagger
 * /api/academic/exams:
 *   get:
 *     summary: Get exams with filtering
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.get('/exams',
  authenticateToken,
  [
    query('courseId').optional().isInt(),
    query('lecturerId').optional().isInt(),
    query('examType').optional().isIn(['midterm', 'final', 'quiz', 'assignment', 'project', 'practical']),
    query('status').optional().isIn(['scheduled', 'ongoing', 'completed', 'cancelled', 'postponed']),
    query('semester').optional().isInt({ min: 1, max: 2 }),
    query('academicYear').optional().isLength({ min: 4, max: 10 }),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  async (req, res) => {
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
        courseId,
        lecturerId,
        examType,
        status,
        semester,
        academicYear,
        startDate,
        endDate,
        page = 1,
        limit = 10
      } = req.query;

      // Build WHERE conditions
      const whereConditions = {};

      if (courseId) whereConditions.courseId = courseId;
      if (lecturerId) whereConditions.lecturerId = lecturerId;
      if (examType) whereConditions.examType = examType;
      if (status) whereConditions.status = status;
      if (semester) whereConditions.semester = semester;
      if (academicYear) whereConditions.academicYear = academicYear;

      if (startDate && endDate) {
        whereConditions.examDate = {
          [Op.between]: [startDate, endDate]
        };
      } else if (startDate) {
        whereConditions.examDate = {
          [Op.gte]: startDate
        };
      } else if (endDate) {
        whereConditions.examDate = {
          [Op.lte]: endDate
        };
      }

      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count
      const total = await Exam.count({ where: whereConditions });

      // Get exams with associations
      const exams = await Exam.findAll({
        where: whereConditions,
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'code', 'name', 'credits']
          },
          {
            model: User,
            as: 'lecturer',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [['examDate', 'ASC'], ['startTime', 'ASC']]
      });

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      };

      logger.info(`Retrieved ${exams.length} exams for user ${req.user.userId}`);

      res.json({
        success: true,
        exams,
        pagination,
        message: 'Exams retrieved successfully'
      });

    } catch (error) {
      logger.error('Get exams error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error retrieving exams',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/academic/exams:
 *   post:
 *     summary: Schedule new exam
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.post('/exams',
  authenticateToken,
  roleAuth(['admin', 'lecturer', 'faculty_coordinator', 'major_coordinator']),
  [
    body('courseId').isInt().withMessage('Valid course ID required'),
    body('examType').isIn(['midterm', 'final', 'quiz', 'assignment', 'project', 'practical']).withMessage('Valid exam type required'),
    body('title').notEmpty().isLength({ min: 3, max: 255 }).withMessage('Title must be 3-255 characters'),
    body('examDate').isISO8601().withMessage('Valid exam date required'),
    body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required (HH:MM)'),
    body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time required (HH:MM)'),
    body('duration').isInt({ min: 15, max: 480 }).withMessage('Duration must be 15-480 minutes'),
    body('totalMarks').optional().isFloat({ min: 1, max: 1000 }).withMessage('Total marks must be 1-1000'),
    body('passingMarks').optional().isFloat({ min: 0 }).withMessage('Passing marks must be non-negative'),
    body('semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
    body('academicYear').notEmpty().withMessage('Academic year required'),
    body('location').optional().isLength({ max: 100 }),
    body('instructions').optional().isLength({ max: 2000 }),
    body('allowLateSubmission').optional().isBoolean(),
    body('lateSubmissionDeadline').optional().isISO8601(),
    body('submissionInstructions').optional().isLength({ max: 1000 })
  ],
  async (req, res) => {
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
        courseId,
        examType,
        title,
        description,
        examDate,
        startTime,
        endTime,
        duration,
        totalMarks = 100,
        passingMarks,
        semester,
        academicYear,
        location,
        instructions,
        allowLateSubmission = false,
        lateSubmissionDeadline,
        submissionInstructions
      } = req.body;

      // Verify course exists
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Validate time logic
      const start = new Date(`1970-01-01T${startTime}:00`);
      const end = new Date(`1970-01-01T${endTime}:00`);
      const calculatedDuration = Math.round((end - start) / (1000 * 60));

      if (calculatedDuration !== duration) {
        return res.status(400).json({
          success: false,
          message: 'Duration does not match start and end times'
        });
      }

      // Create exam
      const exam = await Exam.create({
        courseId,
        lecturerId: req.user.userId,
        examType,
        title,
        description,
        examDate,
        startTime,
        endTime,
        duration,
        totalMarks,
        passingMarks: passingMarks || (totalMarks * 0.4), // Default 40% passing
        semester,
        academicYear,
        location,
        instructions,
        allowLateSubmission,
        lateSubmissionDeadline,
        submissionInstructions,
        status: 'scheduled'
      });

      logger.info(`Exam ${title} scheduled by user ${req.user.userId}`);

      res.status(201).json({
        success: true,
        exam,
        message: 'Exam scheduled successfully'
      });

    } catch (error) {
      logger.error('Schedule exam error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error scheduling exam',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/academic/exams/{id}:
 *   get:
 *     summary: Get exam by ID
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.get('/exams/:id',
  authenticateToken,
  [param('id').isInt()],
  async (req, res) => {
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

      const exam = await Exam.findByPk(id, {
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'code', 'name', 'credits', 'description']
          },
          {
            model: User,
            as: 'lecturer',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ]
      });

      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found'
        });
      }

      logger.info(`Exam ${id} retrieved by user ${req.user.userId}`);

      res.json({
        success: true,
        exam,
        message: 'Exam retrieved successfully'
      });

    } catch (error) {
      logger.error('Get exam by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error retrieving exam',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/academic/exams/{id}:
 *   put:
 *     summary: Update exam
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.put('/exams/:id',
  authenticateToken,
  roleAuth(['admin', 'lecturer', 'faculty_coordinator', 'major_coordinator']),
  [
    param('id').isInt(),
    body('examType').optional().isIn(['midterm', 'final', 'quiz', 'assignment', 'project', 'practical']),
    body('title').optional().isLength({ min: 3, max: 255 }),
    body('examDate').optional().isISO8601(),
    body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('duration').optional().isInt({ min: 15, max: 480 }),
    body('totalMarks').optional().isFloat({ min: 1, max: 1000 }),
    body('passingMarks').optional().isFloat({ min: 0 }),
    body('location').optional().isLength({ max: 100 }),
    body('instructions').optional().isLength({ max: 2000 }),
    body('status').optional().isIn(['scheduled', 'ongoing', 'completed', 'cancelled', 'postponed']),
    body('allowLateSubmission').optional().isBoolean(),
    body('lateSubmissionDeadline').optional().isISO8601(),
    body('submissionInstructions').optional().isLength({ max: 1000 })
  ],
  async (req, res) => {
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

      // Find exam
      const exam = await Exam.findByPk(id);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found'
        });
      }

      // Validate time logic if times are being updated
      if ((updateData.startTime || updateData.endTime || updateData.duration) &&
          updateData.startTime && updateData.endTime) {
        const start = new Date(`1970-01-01T${updateData.startTime}:00`);
        const end = new Date(`1970-01-01T${updateData.endTime}:00`);
        const calculatedDuration = Math.round((end - start) / (1000 * 60));

        if (updateData.duration && calculatedDuration !== updateData.duration) {
          return res.status(400).json({
            success: false,
            message: 'Duration does not match start and end times'
          });
        }
      }

      // Update exam
      await exam.update(updateData);

      logger.info(`Exam ${id} updated by user ${req.user.userId}`);

      res.json({
        success: true,
        exam,
        message: 'Exam updated successfully'
      });

    } catch (error) {
      logger.error('Update exam error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating exam',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/academic/exams/{id}:
 *   delete:
 *     summary: Delete exam
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/exams/:id',
  authenticateToken,
  roleAuth(['admin', 'lecturer', 'faculty_coordinator']),
  [param('id').isInt()],
  async (req, res) => {
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

      // Find exam
      const exam = await Exam.findByPk(id);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found'
        });
      }

      // Delete exam
      await exam.destroy();

      logger.info(`Exam ${id} deleted by user ${req.user.userId}`);

      res.json({
        success: true,
        message: 'Exam deleted successfully'
      });

    } catch (error) {
      logger.error('Delete exam error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error deleting exam',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/academic/exams/{id}/publish:
 *   post:
 *     summary: Publish exam results
 *     tags: [Academic]
 *     security:
 *       - bearerAuth: []
 */
router.post('/exams/:id/publish',
  authenticateToken,
  roleAuth(['admin', 'lecturer', 'faculty_coordinator', 'major_coordinator']),
  [param('id').isInt()],
  async (req, res) => {
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

      // Find exam
      const exam = await Exam.findByPk(id);
      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found'
        });
      }

      // Update exam status to published
      await exam.update({
        isPublished: true,
        publishedAt: new Date(),
        publishedBy: req.user.userId,
        status: 'completed'
      });

      logger.info(`Exam ${id} results published by user ${req.user.userId}`);

      res.json({
        success: true,
        exam,
        message: 'Exam results published successfully'
      });

    } catch (error) {
      logger.error('Publish exam error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error publishing exam results',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;