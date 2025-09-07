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
 *     Student:
 *       type: object
 *       required:
 *         - student_id
 *         - first_name
 *         - last_name
 *         - email
 *         - date_of_birth
 *         - enrollment_date
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated student record ID
 *         student_id:
 *           type: string
 *           description: Unique student identifier
 *         first_name:
 *           type: string
 *           description: Student's first name
 *         last_name:
 *           type: string
 *           description: Student's last name
 *         email:
 *           type: string
 *           format: email
 *           description: Student's email address
 *         phone:
 *           type: string
 *           description: Student's phone number
 *         date_of_birth:
 *           type: string
 *           format: date
 *           description: Student's date of birth
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *         address:
 *           type: object
 *           description: Student's address information
 *         emergency_contact:
 *           type: object
 *           description: Emergency contact information
 *         enrollment_date:
 *           type: string
 *           format: date
 *           description: Date of enrollment
 *         graduation_date:
 *           type: string
 *           format: date
 *           description: Expected or actual graduation date
 *         program_id:
 *           type: integer
 *           description: Academic program ID
 *         year_level:
 *           type: integer
 *           description: Current year level (1-4)
 *         gpa:
 *           type: number
 *           format: float
 *           description: Current GPA
 *         status:
 *           type: string
 *           enum: [active, inactive, graduated, suspended, withdrawn]
 *           default: active
 */

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students with filtering and pagination
 *     tags: [Students]
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
 *         description: Number of students per page
 *       - in: query
 *         name: program_id
 *         schema:
 *           type: integer
 *         description: Filter by program
 *       - in: query
 *         name: year_level
 *         schema:
 *           type: integer
 *         description: Filter by year level
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in student name, ID, or email
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 students:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
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
  roleAuth(['admin', 'academic_staff', 'finance_staff']),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('program_id').optional().isInt(),
    query('year_level').optional().isInt({ min: 1, max: 4 }),
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
        program_id,
        year_level,
        status = 'active',
        search
      } = req.query;

      // Build query conditions
      let whereClause = 'WHERE s.status = $1';
      let queryParams = [status];
      let paramCount = 1;

      if (program_id) {
        whereClause += ` AND s.program_id = $${++paramCount}`;
        queryParams.push(program_id);
      }

      if (year_level) {
        whereClause += ` AND s.year_level = $${++paramCount}`;
        queryParams.push(year_level);
      }

      if (search) {
        whereClause += ` AND (s.first_name ILIKE $${++paramCount} OR s.last_name ILIKE $${++paramCount} OR s.student_id ILIKE $${++paramCount} OR s.email ILIKE $${++paramCount})`;
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
        paramCount += 3; // We added 4 params but only increment by 3 more
      }

      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM students s
        ${whereClause}
      `;

      const countResult = await req.db.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get students with pagination
      const studentsQuery = `
        SELECT 
          s.*,
          p.name as program_name,
          p.degree_type,
          (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = s.id AND e.status = 'enrolled') as enrolled_courses,
          (SELECT AVG(g.grade_points) FROM grades g 
           JOIN enrollments e ON g.enrollment_id = e.id 
           WHERE e.student_id = s.id AND g.grade_points IS NOT NULL) as current_gpa
        FROM students s
        LEFT JOIN programs p ON s.program_id = p.id
        ${whereClause}
        ORDER BY s.last_name, s.first_name
        LIMIT $${++paramCount} OFFSET $${++paramCount}
      `;

      queryParams.push(limit, offset);

      const result = await req.db.query(studentsQuery, queryParams);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      };

      logger.info(`Retrieved ${result.rows.length} students for user ${req.user.id}`);

      res.json({
        students: result.rows,
        pagination
      });

    } catch (error) {
      logger.error('Error fetching students:', error);
      res.status(500).json({ 
        message: 'Error fetching students',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get student by ID with academic history
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student details with academic history
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Student'
 *                 - type: object
 *                   properties:
 *                     enrollments:
 *                       type: array
 *                       description: Course enrollments
 *                     grades:
 *                       type: array
 *                       description: Academic grades
 *                     attendance:
 *                       type: object
 *                       description: Attendance statistics
 *       404:
 *         description: Student not found
 */
router.get('/:id',
  authenticateToken,
  roleAuth(['admin', 'academic_staff', 'finance_staff']),
  [param('id').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      // Get student basic information
      const studentQuery = `
        SELECT 
          s.*,
          p.name as program_name,
          p.degree_type,
          p.duration_years
        FROM students s
        LEFT JOIN programs p ON s.program_id = p.id
        WHERE s.id = $1
      `;

      const studentResult = await req.db.query(studentQuery, [id]);

      if (studentResult.rows.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const student = studentResult.rows[0];

      // Get current enrollments
      const enrollmentsQuery = `
        SELECT 
          e.*,
          c.code as course_code,
          c.name as course_name,
          c.credits,
          c.semester,
          c.year,
          u.first_name || ' ' || u.last_name as instructor_name
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN users u ON c.instructor_id = u.id
        WHERE e.student_id = $1
        ORDER BY c.year DESC, c.semester, c.code
      `;

      const enrollmentsResult = await req.db.query(enrollmentsQuery, [id]);
      student.enrollments = enrollmentsResult.rows;

      // Get grades
      const gradesQuery = `
        SELECT 
          g.*,
          c.code as course_code,
          c.name as course_name,
          c.credits,
          c.semester,
          c.year
        FROM grades g
        JOIN enrollments e ON g.enrollment_id = e.id
        JOIN courses c ON e.course_id = c.id
        WHERE e.student_id = $1
        ORDER BY c.year DESC, c.semester, c.code
      `;

      const gradesResult = await req.db.query(gradesQuery, [id]);
      student.grades = gradesResult.rows;

      // Calculate GPA
      const gpaQuery = `
        SELECT 
          AVG(g.grade_points) as overall_gpa,
          SUM(c.credits * g.grade_points) / SUM(c.credits) as weighted_gpa,
          SUM(c.credits) as total_credits
        FROM grades g
        JOIN enrollments e ON g.enrollment_id = e.id
        JOIN courses c ON e.course_id = c.id
        WHERE e.student_id = $1 AND g.grade_points IS NOT NULL
      `;

      const gpaResult = await req.db.query(gpaQuery, [id]);
      student.academic_summary = gpaResult.rows[0];

      // Get attendance statistics
      const attendanceQuery = `
        SELECT 
          COUNT(*) as total_sessions,
          SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_sessions,
          ROUND(
            (SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END)::float / COUNT(*)) * 100, 2
          ) as attendance_percentage
        FROM attendance a
        JOIN enrollments e ON a.enrollment_id = e.id
        WHERE e.student_id = $1
      `;

      const attendanceResult = await req.db.query(attendanceQuery, [id]);
      student.attendance_summary = attendanceResult.rows[0];

      logger.info(`Retrieved student ${id} details for user ${req.user.id}`);

      res.json(student);

    } catch (error) {
      logger.error('Error fetching student:', error);
      res.status(500).json({ 
        message: 'Error fetching student',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
