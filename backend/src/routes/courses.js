const express = require('express');
const router = express.Router();
const { body, validationResult, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const logger = require('../utils/logger');

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - code
 *         - name
 *         - credits
 *         - department_id
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated course ID
 *         code:
 *           type: string
 *           description: Unique course code (e.g., CS101)
 *         name:
 *           type: string
 *           description: Course name
 *         description:
 *           type: string
 *           description: Course description
 *         credits:
 *           type: integer
 *           description: Number of credits
 *         department_id:
 *           type: integer
 *           description: Department ID
 *         instructor_id:
 *           type: integer
 *           description: Primary instructor ID
 *         semester:
 *           type: string
 *           enum: [Fall, Spring, Summer]
 *         year:
 *           type: integer
 *           description: Academic year
 *         capacity:
 *           type: integer
 *           description: Maximum enrollment capacity
 *         schedule:
 *           type: object
 *           description: Class schedule information
 *         prerequisites:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of prerequisite course IDs
 *         status:
 *           type: string
 *           enum: [active, inactive, archived]
 *           default: active
 */

/**
 * @swagger
 * /api/courses:
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
 *         name: department_id
 *         schema:
 *           type: integer
 *         description: Filter by department
 *       - in: query
 *         name: semester
 *         schema:
 *           type: string
 *         description: Filter by semester
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in course code, name, or description
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
router.get('/', 
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('department_id').optional().isInt(),
    query('year').optional().isInt(),
    query('search').optional().isLength({ min: 1, max: 100 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        page = 1,
        limit = 10,
        department_id,
        semester,
        year,
        search,
        status = 'active'
      } = req.query;

      // Build query conditions
      let whereClause = 'WHERE c.status = $1';
      let queryParams = [status];
      let paramCount = 1;

      if (department_id) {
        whereClause += ` AND c.department_id = $${++paramCount}`;
        queryParams.push(department_id);
      }

      if (semester) {
        whereClause += ` AND c.semester = $${++paramCount}`;
        queryParams.push(semester);
      }

      if (year) {
        whereClause += ` AND c.year = $${++paramCount}`;
        queryParams.push(year);
      }

      if (search) {
        whereClause += ` AND (c.code ILIKE $${++paramCount} OR c.name ILIKE $${++paramCount} OR c.description ILIKE $${++paramCount})`;
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern);
        paramCount += 2; // We added 3 params but only increment by 2 more
      }

      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM courses c
        ${whereClause}
      `;

      const countResult = await req.db.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get courses with pagination
      const coursesQuery = `
        SELECT 
          c.*,
          d.name as department_name,
          u.first_name || ' ' || u.last_name as instructor_name,
          (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'enrolled') as enrolled_count
        FROM courses c
        LEFT JOIN departments d ON c.department_id = d.id
        LEFT JOIN users u ON c.instructor_id = u.id
        ${whereClause}
        ORDER BY c.code, c.name
        LIMIT $${++paramCount} OFFSET $${++paramCount}
      `;

      queryParams.push(limit, offset);

      const result = await req.db.query(coursesQuery, queryParams);

      // Get prerequisites for each course
      for (let course of result.rows) {
        const prereqQuery = `
          SELECT 
            c.id,
            c.code,
            c.name
          FROM course_prerequisites cp
          JOIN courses c ON cp.prerequisite_course_id = c.id
          WHERE cp.course_id = $1
        `;
        const prereqResult = await req.db.query(prereqQuery, [course.id]);
        course.prerequisites = prereqResult.rows;
      }

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      };

      logger.info(`Retrieved ${result.rows.length} courses for user ${req.user.id}`);

      res.json({
        courses: result.rows,
        pagination
      });

    } catch (error) {
      logger.error('Error fetching courses:', error);
      res.status(500).json({ 
        message: 'Error fetching courses',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/courses/{id}:
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
 *           type: integer
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
router.get('/:id',
  authenticateToken,
  [param('id').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      const query = `
        SELECT 
          c.*,
          d.name as department_name,
          u.first_name || ' ' || u.last_name as instructor_name,
          (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'enrolled') as enrolled_count
        FROM courses c
        LEFT JOIN departments d ON c.department_id = d.id
        LEFT JOIN users u ON c.instructor_id = u.id
        WHERE c.id = $1
      `;

      const result = await req.db.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Course not found' });
      }

      const course = result.rows[0];

      // Get prerequisites
      const prereqQuery = `
        SELECT 
          c.id,
          c.code,
          c.name
        FROM course_prerequisites cp
        JOIN courses c ON cp.prerequisite_course_id = c.id
        WHERE cp.course_id = $1
      `;
      const prereqResult = await req.db.query(prereqQuery, [id]);
      course.prerequisites = prereqResult.rows;

      // Get enrolled students (if user has permission)
      if (req.user.role === 'admin' || req.user.role === 'academic_staff' || req.user.id === course.instructor_id) {
        const studentsQuery = `
          SELECT 
            u.id,
            u.first_name,
            u.last_name,
            u.email,
            e.enrollment_date,
            e.status
          FROM enrollments e
          JOIN users u ON e.student_id = u.id
          WHERE e.course_id = $1
          ORDER BY u.last_name, u.first_name
        `;
        const studentsResult = await req.db.query(studentsQuery, [id]);
        course.enrolled_students = studentsResult.rows;
      }

      logger.info(`Retrieved course ${id} for user ${req.user.id}`);

      res.json(course);

    } catch (error) {
      logger.error('Error fetching course:', error);
      res.status(500).json({ 
        message: 'Error fetching course',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
