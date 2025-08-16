const express = require('express');
const router = express.Router();
const { body, validationResult, param, query } = require('express-validator');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const logger = require('../utils/logger');

/**
 * @swagger
 * components:
 *   schemas:
 *     Grade:
 *       type: object
 *       required:
 *         - enrollment_id
 *         - assignment_type
 *         - assignment_name
 *         - points_earned
 *         - points_possible
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated grade ID
 *         enrollment_id:
 *           type: integer
 *           description: Student enrollment ID
 *         assignment_type:
 *           type: string
 *           enum: [exam, quiz, assignment, project, participation, final]
 *           description: Type of assignment
 *         assignment_name:
 *           type: string
 *           description: Name of the assignment
 *         points_earned:
 *           type: number
 *           format: float
 *           description: Points earned by student
 *         points_possible:
 *           type: number
 *           format: float
 *           description: Maximum points possible
 *         percentage:
 *           type: number
 *           format: float
 *           description: Calculated percentage (points_earned/points_possible * 100)
 *         letter_grade:
 *           type: string
 *           description: Letter grade (A, B, C, D, F)
 *         grade_points:
 *           type: number
 *           format: float
 *           description: Grade points for GPA calculation (4.0 scale)
 *         weight:
 *           type: number
 *           format: float
 *           description: Weight of assignment in final grade
 *         due_date:
 *           type: string
 *           format: date
 *           description: Assignment due date
 *         graded_date:
 *           type: string
 *           format: date-time
 *           description: Date when grade was entered
 *         comments:
 *           type: string
 *           description: Instructor comments
 *         status:
 *           type: string
 *           enum: [draft, published, late, excused]
 *           default: draft
 */

/**
 * @swagger
 * /api/grades/course/{courseId}:
 *   get:
 *     summary: Get all grades for a specific course
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Course ID
 *       - in: query
 *         name: assignment_type
 *         schema:
 *           type: string
 *         description: Filter by assignment type
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *         description: Filter by specific student
 *     responses:
 *       200:
 *         description: Course grades with student information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 course:
 *                   type: object
 *                   description: Course information
 *                 students:
 *                   type: array
 *                   description: Students with their grades
 *                 assignments:
 *                   type: array
 *                   description: All assignments for the course
 *                 grade_distribution:
 *                   type: object
 *                   description: Grade distribution statistics
 */
router.get('/course/:courseId',
  auth,
  roleAuth(['admin', 'academic_staff']),
  [param('courseId').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { courseId } = req.params;
      const { assignment_type, student_id } = req.query;

      // Verify instructor has access to this course
      if (req.user.role === 'academic_staff') {
        const courseCheck = await req.db.query(
          'SELECT instructor_id FROM courses WHERE id = $1',
          [courseId]
        );
        
        if (courseCheck.rows.length === 0) {
          return res.status(404).json({ message: 'Course not found' });
        }
        
        if (courseCheck.rows[0].instructor_id !== req.user.id) {
          return res.status(403).json({ message: 'Access denied to this course' });
        }
      }

      // Get course information
      const courseQuery = `
        SELECT 
          c.*,
          u.first_name || ' ' || u.last_name as instructor_name
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        WHERE c.id = $1
      `;
      const courseResult = await req.db.query(courseQuery, [courseId]);
      const course = courseResult.rows[0];

      // Build grade query conditions
      let whereClause = 'WHERE e.course_id = $1';
      let queryParams = [courseId];
      let paramCount = 1;

      if (assignment_type) {
        whereClause += ` AND g.assignment_type = $${++paramCount}`;
        queryParams.push(assignment_type);
      }

      if (student_id) {
        whereClause += ` AND e.student_id = $${++paramCount}`;
        queryParams.push(student_id);
      }

      // Get students with their grades
      const studentsQuery = `
        SELECT DISTINCT
          s.id as student_id,
          s.student_id as student_number,
          s.first_name,
          s.last_name,
          s.email,
          e.id as enrollment_id,
          e.enrollment_date,
          (
            SELECT AVG(g.grade_points) 
            FROM grades g 
            WHERE g.enrollment_id = e.id AND g.grade_points IS NOT NULL
          ) as current_grade
        FROM students s
        JOIN enrollments e ON s.id = e.student_id
        ${whereClause}
        ORDER BY s.last_name, s.first_name
      `;

      const studentsResult = await req.db.query(studentsQuery, queryParams);

      // Get all assignments for this course
      const assignmentsQuery = `
        SELECT DISTINCT
          g.assignment_type,
          g.assignment_name,
          g.points_possible,
          g.weight,
          g.due_date,
          COUNT(*) as submission_count,
          AVG(g.percentage) as average_score
        FROM grades g
        JOIN enrollments e ON g.enrollment_id = e.id
        WHERE e.course_id = $1
        GROUP BY g.assignment_type, g.assignment_name, g.points_possible, g.weight, g.due_date
        ORDER BY g.due_date DESC, g.assignment_name
      `;

      const assignmentsResult = await req.db.query(assignmentsQuery, [courseId]);

      // Get detailed grades for each student
      for (let student of studentsResult.rows) {
        const gradesQuery = `
          SELECT 
            g.*,
            g.points_earned::float / g.points_possible::float * 100 as calculated_percentage
          FROM grades g
          WHERE g.enrollment_id = $1
          ORDER BY g.due_date DESC, g.assignment_name
        `;
        
        const gradesResult = await req.db.query(gradesQuery, [student.enrollment_id]);
        student.grades = gradesResult.rows;
      }

      // Calculate grade distribution
      const distributionQuery = `
        SELECT 
          CASE 
            WHEN AVG(g.grade_points) >= 3.7 THEN 'A'
            WHEN AVG(g.grade_points) >= 3.0 THEN 'B'
            WHEN AVG(g.grade_points) >= 2.0 THEN 'C'
            WHEN AVG(g.grade_points) >= 1.0 THEN 'D'
            ELSE 'F'
          END as letter_grade,
          COUNT(*) as count
        FROM (
          SELECT 
            e.student_id,
            AVG(g.grade_points) as avg_grade
          FROM grades g
          JOIN enrollments e ON g.enrollment_id = e.id
          WHERE e.course_id = $1 AND g.grade_points IS NOT NULL
          GROUP BY e.student_id
        ) student_averages
        GROUP BY 
          CASE 
            WHEN AVG(g.grade_points) >= 3.7 THEN 'A'
            WHEN AVG(g.grade_points) >= 3.0 THEN 'B'
            WHEN AVG(g.grade_points) >= 2.0 THEN 'C'
            WHEN AVG(g.grade_points) >= 1.0 THEN 'D'
            ELSE 'F'
          END
        ORDER BY letter_grade
      `;

      const distributionResult = await req.db.query(distributionQuery, [courseId]);

      logger.info(`Retrieved grades for course ${courseId} by user ${req.user.id}`);

      res.json({
        course,
        students: studentsResult.rows,
        assignments: assignmentsResult.rows,
        grade_distribution: distributionResult.rows
      });

    } catch (error) {
      logger.error('Error fetching course grades:', error);
      res.status(500).json({ 
        message: 'Error fetching course grades',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/grades:
 *   post:
 *     summary: Create or update a grade
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Grade'
 *     responses:
 *       201:
 *         description: Grade created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied
 */
router.post('/',
  auth,
  roleAuth(['admin', 'academic_staff']),
  [
    body('enrollment_id').isInt(),
    body('assignment_type').isIn(['exam', 'quiz', 'assignment', 'project', 'participation', 'final']),
    body('assignment_name').isLength({ min: 1, max: 255 }),
    body('points_earned').isFloat({ min: 0 }),
    body('points_possible').isFloat({ min: 0.1 }),
    body('weight').optional().isFloat({ min: 0, max: 1 }),
    body('due_date').optional().isISO8601(),
    body('comments').optional().isLength({ max: 1000 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        enrollment_id,
        assignment_type,
        assignment_name,
        points_earned,
        points_possible,
        weight = 1.0,
        due_date,
        comments,
        status = 'published'
      } = req.body;

      // Verify instructor has access to this enrollment's course
      if (req.user.role === 'academic_staff') {
        const enrollmentCheck = await req.db.query(`
          SELECT c.instructor_id 
          FROM enrollments e 
          JOIN courses c ON e.course_id = c.id 
          WHERE e.id = $1
        `, [enrollment_id]);
        
        if (enrollmentCheck.rows.length === 0) {
          return res.status(404).json({ message: 'Enrollment not found' });
        }
        
        if (enrollmentCheck.rows[0].instructor_id !== req.user.id) {
          return res.status(403).json({ message: 'Access denied to this course' });
        }
      }

      // Calculate percentage and grade points
      const percentage = (points_earned / points_possible) * 100;
      let letter_grade, grade_points;

      if (percentage >= 97) { letter_grade = 'A+'; grade_points = 4.0; }
      else if (percentage >= 93) { letter_grade = 'A'; grade_points = 4.0; }
      else if (percentage >= 90) { letter_grade = 'A-'; grade_points = 3.7; }
      else if (percentage >= 87) { letter_grade = 'B+'; grade_points = 3.3; }
      else if (percentage >= 83) { letter_grade = 'B'; grade_points = 3.0; }
      else if (percentage >= 80) { letter_grade = 'B-'; grade_points = 2.7; }
      else if (percentage >= 77) { letter_grade = 'C+'; grade_points = 2.3; }
      else if (percentage >= 73) { letter_grade = 'C'; grade_points = 2.0; }
      else if (percentage >= 70) { letter_grade = 'C-'; grade_points = 1.7; }
      else if (percentage >= 67) { letter_grade = 'D+'; grade_points = 1.3; }
      else if (percentage >= 65) { letter_grade = 'D'; grade_points = 1.0; }
      else { letter_grade = 'F'; grade_points = 0.0; }

      // Check if grade already exists for this assignment
      const existingGrade = await req.db.query(`
        SELECT id FROM grades 
        WHERE enrollment_id = $1 AND assignment_name = $2
      `, [enrollment_id, assignment_name]);

      let result;
      if (existingGrade.rows.length > 0) {
        // Update existing grade
        const updateQuery = `
          UPDATE grades SET
            assignment_type = $1,
            points_earned = $2,
            points_possible = $3,
            percentage = $4,
            letter_grade = $5,
            grade_points = $6,
            weight = $7,
            due_date = $8,
            comments = $9,
            status = $10,
            graded_date = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $11
          RETURNING *
        `;

        result = await req.db.query(updateQuery, [
          assignment_type, points_earned, points_possible, percentage,
          letter_grade, grade_points, weight, due_date, comments, status,
          existingGrade.rows[0].id
        ]);
      } else {
        // Create new grade
        const insertQuery = `
          INSERT INTO grades (
            enrollment_id, assignment_type, assignment_name, points_earned,
            points_possible, percentage, letter_grade, grade_points, weight,
            due_date, comments, status, graded_date
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
          RETURNING *
        `;

        result = await req.db.query(insertQuery, [
          enrollment_id, assignment_type, assignment_name, points_earned,
          points_possible, percentage, letter_grade, grade_points, weight,
          due_date, comments, status
        ]);
      }

      logger.info(`Grade ${existingGrade.rows.length > 0 ? 'updated' : 'created'} for enrollment ${enrollment_id} by user ${req.user.id}`);

      res.status(existingGrade.rows.length > 0 ? 200 : 201).json({
        message: `Grade ${existingGrade.rows.length > 0 ? 'updated' : 'created'} successfully`,
        grade: result.rows[0]
      });

    } catch (error) {
      logger.error('Error creating/updating grade:', error);
      res.status(500).json({ 
        message: 'Error processing grade',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
