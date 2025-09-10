const express = require('express');
const router = express.Router();
const { body, validationResult, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { logger } = require('../utils/logger');
const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Course = require('../models/Course');
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const { Op } = require('sequelize');

/**
 * @swagger
 * components:
 *   schemas:
 *     Grade:
 *       type: object
 *       required:
 *         - studentId
 *         - courseId
 *         - lecturerId
 *         - semester
 *         - academicYear
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
 *         semester:
 *           type: integer
 *           enum: [1, 2]
 *         academicYear:
 *           type: string
 *         caMarks:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 30
 *         examMarks:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 70
 *         totalMarks:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 100
 *         letterGrade:
 *           type: string
 *         gradePoints:
 *           type: number
 *           format: float
 *         status:
 *           type: string
 *           enum: [draft, published, locked]
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         publishedBy:
 *           type: string
 *           format: uuid
 */

/**
 * @swagger
 * /api/grades:
 *   get:
 *     summary: Get grades with filtering
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: lecturerId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: semester
 *         schema:
 *           type: integer
 *           enum: [1, 2]
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, locked]
 *     responses:
 *       200:
 *         description: List of grades
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 grades:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Grade'
 */
router.get('/',
  authenticateToken,
  [
    query('courseId').optional().isUUID(),
    query('studentId').optional().isUUID(),
    query('lecturerId').optional().isUUID(),
    query('semester').optional().isInt({ min: 1, max: 2 }),
    query('academicYear').optional().isString(),
    query('status').optional().isIn(['draft', 'published', 'locked'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        courseId,
        studentId,
        lecturerId,
        semester,
        academicYear = new Date().getFullYear().toString(),
        status
      } = req.query;

      // Build WHERE conditions
      const whereConditions = { academicYear };

      if (courseId) whereConditions.courseId = courseId;
      if (studentId) whereConditions.studentId = studentId;
      if (lecturerId) whereConditions.lecturerId = lecturerId;
      if (semester) whereConditions.semester = semester;
      if (status) whereConditions.status = status;

      // Role-based access control
      const userRole = req.user.role;
      if (userRole === 'student') {
        whereConditions.studentId = req.user.id;
      } else if (userRole === 'lecturer') {
        whereConditions.lecturerId = req.user.id;
      }

      // Get grades with related data
      const grades = await Grade.findAll({
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
            attributes: ['courseCode', 'courseName', 'credits']
          },
          {
            model: User,
            as: 'lecturer',
            attributes: ['firstName', 'lastName', 'email']
          }
        ],
        order: [
          ['courseId', 'ASC'],
          ['studentId', 'ASC']
        ]
      });

      logger.info(`Retrieved ${grades.length} grades for user ${req.user.id}`);

      res.json({
        grades,
        filters: {
          courseId,
          studentId,
          lecturerId,
          semester,
          academicYear,
          status
        }
      });

    } catch (error) {
      logger.error('Error fetching grades:', error);
      res.status(500).json({
        message: 'Error fetching grades',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/grades/bulk:
 *   post:
 *     summary: Bulk create/update grades for a course (Lecturer only)
 *     tags: [Grades]
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
 *               - semester
 *               - academicYear
 *               - grades
 *             properties:
 *               courseId:
 *                 type: string
 *                 format: uuid
 *               semester:
 *                 type: integer
 *                 enum: [1, 2]
 *               academicYear:
 *                 type: string
 *               grades:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - studentId
 *                     - caMarks
 *                     - examMarks
 *                   properties:
 *                     studentId:
 *                       type: string
 *                       format: uuid
 *                     caMarks:
 *                       type: number
 *                       format: float
 *                       minimum: 0
 *                       maximum: 30
 *                     examMarks:
 *                       type: number
 *                       format: float
 *                       minimum: 0
 *                       maximum: 70
 *     responses:
 *       201:
 *         description: Grades created/updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized to manage grades for this course
 */
router.post('/bulk',
  authenticateToken,
  roleAuth(['lecturer', 'faculty_coordinator', 'major_coordinator']),
  [
    body('courseId').isUUID().withMessage('Valid course ID is required'),
    body('semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
    body('academicYear').notEmpty().withMessage('Academic year is required'),
    body('grades').isArray().withMessage('Grades array is required'),
    body('grades.*.studentId').isUUID().withMessage('Valid student ID is required'),
    body('grades.*.caMarks').isFloat({ min: 0, max: 30 }).withMessage('CA marks must be between 0 and 30'),
    body('grades.*.examMarks').isFloat({ min: 0, max: 70 }).withMessage('Exam marks must be between 0 and 70')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const lecturerId = req.user.id;
      const { courseId, semester, academicYear, grades } = req.body;

      // Check if lecturer is assigned to this course
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // For lecturers, check if they are assigned to the course
      if (req.user.role === 'lecturer' && course.instructorId !== lecturerId) {
        return res.status(403).json({
          message: 'You are not authorized to manage grades for this course'
        });
      }

      // Get all students enrolled in the course
      const enrolledStudents = await Student.findAll({
        where: {
          facultyId: course.facultyId,
          departmentId: course.departmentId,
          semester: semester
        },
        attributes: ['id', 'matricule', 'firstName', 'lastName', 'email']
      });

      const enrolledStudentIds = enrolledStudents.map(s => s.id);

      // Process grades
      const processedGrades = [];
      const validationErrors = [];

      for (const gradeData of grades) {
        const { studentId, caMarks, examMarks } = gradeData;

        // Check if student is enrolled in the course
        if (!enrolledStudentIds.includes(studentId)) {
          validationErrors.push(`Student ${studentId} is not enrolled in this course`);
          continue;
        }

        // Find or create grade record
        const [grade, created] = await Grade.findOrCreate({
          where: {
            studentId,
            courseId,
            semester,
            academicYear
          },
          defaults: {
            lecturerId,
            caMarks,
            examMarks,
            status: 'draft'
          }
        });

        if (!created) {
          // Update existing grade
          await grade.update({
            caMarks,
            examMarks,
            lecturerId
          });
        }

        processedGrades.push(grade);
      }

      logger.info(`Bulk grades processed for course ${courseId} by lecturer ${lecturerId}`);

      res.status(201).json({
        message: 'Grades processed successfully',
        processed: processedGrades.length,
        errors: validationErrors.length > 0 ? validationErrors : undefined,
        grades: processedGrades
      });

    } catch (error) {
      logger.error('Error processing bulk grades:', error);
      res.status(500).json({
        message: 'Error processing grades',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/grades/{id}:
 *   put:
 *     summary: Update grade (Lecturer/Coordinator only)
 *     tags: [Grades]
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
 *               caMarks:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 30
 *               examMarks:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 70
 *               status:
 *                 type: string
 *                 enum: [draft, published, locked]
 *     responses:
 *       200:
 *         description: Grade updated successfully
 *       403:
 *         description: Not authorized to update this grade
 *       404:
 *         description: Grade not found
 */
router.put('/:id',
  authenticateToken,
  roleAuth(['lecturer', 'faculty_coordinator', 'major_coordinator']),
  [
    param('id').isUUID(),
    body('caMarks').optional().isFloat({ min: 0, max: 30 }),
    body('examMarks').optional().isFloat({ min: 0, max: 70 }),
    body('status').optional().isIn(['draft', 'published', 'locked'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Find grade
      const grade = await Grade.findByPk(id);
      if (!grade) {
        return res.status(404).json({ message: 'Grade not found' });
      }

      // Check permissions
      if (req.user.role === 'lecturer' && grade.lecturerId !== userId) {
        return res.status(403).json({
          message: 'You are not authorized to update this grade'
        });
      }

      // For coordinators, check if they have permission for the course's faculty
      if (req.user.role.includes('coordinator')) {
        const course = await Course.findByPk(grade.courseId);
        if (course) {
          const faculty = await Faculty.findByPk(course.facultyId);
          if (!faculty || faculty.coordinatorId !== userId) {
            return res.status(403).json({
              message: 'You are not authorized to update grades for this faculty'
            });
          }
        }
      }

      // Update grade
      await grade.update(updateData);

      // Set published info if status is published
      if (updateData.status === 'published') {
        await grade.update({
          publishedAt: new Date(),
          publishedBy: userId
        });
      }

      logger.info(`Grade ${id} updated by user ${userId}`);

      res.json({
        message: 'Grade updated successfully',
        grade
      });

    } catch (error) {
      logger.error('Error updating grade:', error);
      res.status(500).json({
        message: 'Error updating grade',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/grades/publish:
 *   post:
 *     summary: Publish grades for a course (Lecturer/Coordinator only)
 *     tags: [Grades]
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
 *               - semester
 *               - academicYear
 *             properties:
 *               courseId:
 *                 type: string
 *                 format: uuid
 *               semester:
 *                 type: integer
 *                 enum: [1, 2]
 *               academicYear:
 *                 type: string
 *     responses:
 *       200:
 *         description: Grades published successfully
 *       403:
 *         description: Not authorized to publish grades for this course
 */
router.post('/publish',
  authenticateToken,
  roleAuth(['lecturer', 'faculty_coordinator', 'major_coordinator']),
  [
    body('courseId').isUUID().withMessage('Valid course ID is required'),
    body('semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
    body('academicYear').notEmpty().withMessage('Academic year is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const { courseId, semester, academicYear } = req.body;

      // Check permissions
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      if (req.user.role === 'lecturer' && course.instructorId !== userId) {
        return res.status(403).json({
          message: 'You are not authorized to publish grades for this course'
        });
      }

      // For coordinators, check faculty permission
      if (req.user.role.includes('coordinator')) {
        const faculty = await Faculty.findByPk(course.facultyId);
        if (!faculty || faculty.coordinatorId !== userId) {
          return res.status(403).json({
            message: 'You are not authorized to publish grades for this faculty'
          });
        }
      }

      // Publish all grades for the course
      const [affectedRows] = await Grade.update(
        {
          status: 'published',
          publishedAt: new Date(),
          publishedBy: userId
        },
        {
          where: {
            courseId,
            semester,
            academicYear,
            status: 'draft'
          }
        }
      );

      logger.info(`${affectedRows} grades published for course ${courseId} by user ${userId}`);

      res.json({
        message: 'Grades published successfully',
        published: affectedRows
      });

    } catch (error) {
      logger.error('Error publishing grades:', error);
      res.status(500).json({
        message: 'Error publishing grades',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/grades/export:
 *   get:
 *     summary: Export grades for a course (Lecturer/Coordinator only)
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: semester
 *         required: true
 *         schema:
 *           type: integer
 *           enum: [1, 2]
 *       - in: query
 *         name: academicYear
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [excel, pdf]
 *           default: excel
 *     responses:
 *       200:
 *         description: Grades exported successfully
 *       403:
 *         description: Not authorized to export grades for this course
 */
router.get('/export',
  authenticateToken,
  roleAuth(['lecturer', 'faculty_coordinator', 'major_coordinator']),
  [
    query('courseId').isUUID().withMessage('Valid course ID is required'),
    query('semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
    query('academicYear').notEmpty().withMessage('Academic year is required'),
    query('format').optional().isIn(['excel', 'pdf'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const { courseId, semester, academicYear, format = 'excel' } = req.query;

      // Check permissions
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      if (req.user.role === 'lecturer' && course.instructorId !== userId) {
        return res.status(403).json({
          message: 'You are not authorized to export grades for this course'
        });
      }

      // Get grades for export
      const grades = await Grade.findAll({
        where: {
          courseId,
          semester,
          academicYear
        },
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['matricule', 'firstName', 'lastName', 'email']
          }
        ],
        order: [['studentId', 'ASC']]
      });

      // Format data for export
      const exportData = grades.map(grade => ({
        Matricule: grade.student.matricule,
        'First Name': grade.student.firstName,
        'Last Name': grade.student.lastName,
        Email: grade.student.email,
        'CA Marks': grade.caMarks || 0,
        'Exam Marks': grade.examMarks || 0,
        'Total Marks': grade.totalMarks || 0,
        'Letter Grade': grade.letterGrade || '',
        'Grade Points': grade.gradePoints || 0,
        Status: grade.status
      }));

      // TODO: Implement actual Excel/PDF export
      // For now, return JSON data
      logger.info(`Grades exported for course ${courseId} by user ${userId}`);

      res.json({
        message: 'Grades export data retrieved successfully',
        course: {
          code: course.courseCode,
          name: course.courseName
        },
        semester,
        academicYear,
        format,
        data: exportData
      });

    } catch (error) {
      logger.error('Error exporting grades:', error);
      res.status(500).json({
        message: 'Error exporting grades',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
