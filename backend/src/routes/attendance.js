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
 *     Attendance:
 *       type: object
 *       required:
 *         - enrollment_id
 *         - session_date
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated attendance ID
 *         enrollment_id:
 *           type: integer
 *           description: Student enrollment ID
 *         session_date:
 *           type: string
 *           format: date
 *           description: Date of the class session
 *         session_time:
 *           type: string
 *           description: Time of the class session
 *         status:
 *           type: string
 *           enum: [present, absent, late, excused]
 *           description: Attendance status
 *         check_in_time:
 *           type: string
 *           format: time
 *           description: Time student checked in
 *         notes:
 *           type: string
 *           description: Additional notes about attendance
 *         recorded_by:
 *           type: integer
 *           description: ID of user who recorded attendance
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 */

/**
 * @swagger
 * /api/attendance/course/{courseId}:
 *   get:
 *     summary: Get attendance records for a specific course
 *     tags: [Attendance]
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
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for attendance records
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for attendance records
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *         description: Filter by specific student
 *     responses:
 *       200:
 *         description: Course attendance records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 course:
 *                   type: object
 *                   description: Course information
 *                 sessions:
 *                   type: array
 *                   description: Class sessions with attendance
 *                 students:
 *                   type: array
 *                   description: Students with attendance statistics
 *                 summary:
 *                   type: object
 *                   description: Attendance summary statistics
 */
router.get('/course/:courseId',
  auth,
  roleAuth(['admin', 'academic_staff']),
  [
    param('courseId').isInt(),
    query('date_from').optional().isISO8601(),
    query('date_to').optional().isISO8601(),
    query('student_id').optional().isInt()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { courseId } = req.params;
      const { date_from, date_to, student_id } = req.query;

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
          u.first_name || ' ' || u.last_name as instructor_name,
          COUNT(DISTINCT e.student_id) as enrolled_students
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'enrolled'
        WHERE c.id = $1
        GROUP BY c.id, u.first_name, u.last_name
      `;
      const courseResult = await req.db.query(courseQuery, [courseId]);
      const course = courseResult.rows[0];

      // Build attendance query conditions
      let whereClause = 'WHERE e.course_id = $1';
      let queryParams = [courseId];
      let paramCount = 1;

      if (date_from) {
        whereClause += ` AND a.session_date >= $${++paramCount}`;
        queryParams.push(date_from);
      }

      if (date_to) {
        whereClause += ` AND a.session_date <= $${++paramCount}`;
        queryParams.push(date_to);
      }

      if (student_id) {
        whereClause += ` AND e.student_id = $${++paramCount}`;
        queryParams.push(student_id);
      }

      // Get attendance sessions
      const sessionsQuery = `
        SELECT DISTINCT
          a.session_date,
          a.session_time,
          COUNT(*) as total_students,
          SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
          SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
          SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
          SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as excused_count
        FROM attendance a
        JOIN enrollments e ON a.enrollment_id = e.id
        ${whereClause}
        GROUP BY a.session_date, a.session_time
        ORDER BY a.session_date DESC, a.session_time
      `;

      const sessionsResult = await req.db.query(sessionsQuery, queryParams);

      // Get students with attendance statistics
      const studentsQuery = `
        SELECT 
          s.id as student_id,
          s.student_id as student_number,
          s.first_name,
          s.last_name,
          s.email,
          e.id as enrollment_id,
          COUNT(a.id) as total_sessions,
          SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
          SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
          SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
          SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as excused_count,
          CASE 
            WHEN COUNT(a.id) > 0 THEN 
              ROUND((SUM(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END)::float / COUNT(a.id)) * 100, 2)
            ELSE 0 
          END as attendance_percentage
        FROM students s
        JOIN enrollments e ON s.id = e.student_id
        LEFT JOIN attendance a ON e.id = a.enrollment_id
        ${whereClause}
        GROUP BY s.id, s.student_id, s.first_name, s.last_name, s.email, e.id
        ORDER BY s.last_name, s.first_name
      `;

      const studentsResult = await req.db.query(studentsQuery, queryParams);

      // Get detailed attendance records for each student
      for (let student of studentsResult.rows) {
        const attendanceQuery = `
          SELECT 
            a.*
          FROM attendance a
          WHERE a.enrollment_id = $1
          ORDER BY a.session_date DESC, a.session_time
        `;
        
        const attendanceResult = await req.db.query(attendanceQuery, [student.enrollment_id]);
        student.attendance_records = attendanceResult.rows;
      }

      // Calculate summary statistics
      const summaryQuery = `
        SELECT 
          COUNT(DISTINCT a.session_date) as total_sessions,
          COUNT(DISTINCT e.student_id) as total_students,
          AVG(CASE 
            WHEN COUNT(a.id) > 0 THEN 
              (SUM(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END)::float / COUNT(a.id)) * 100
            ELSE 0 
          END) as average_attendance_rate,
          COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as total_absences
        FROM enrollments e
        LEFT JOIN attendance a ON e.id = a.enrollment_id
        WHERE e.course_id = $1
        GROUP BY e.course_id
      `;

      const summaryResult = await req.db.query(summaryQuery, [courseId]);

      logger.info(`Retrieved attendance for course ${courseId} by user ${req.user.id}`);

      res.json({
        course,
        sessions: sessionsResult.rows,
        students: studentsResult.rows,
        summary: summaryResult.rows[0] || {
          total_sessions: 0,
          total_students: 0,
          average_attendance_rate: 0,
          total_absences: 0
        }
      });

    } catch (error) {
      logger.error('Error fetching course attendance:', error);
      res.status(500).json({ 
        message: 'Error fetching course attendance',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Record attendance for a class session
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *               - session_date
 *               - attendance_records
 *             properties:
 *               course_id:
 *                 type: integer
 *               session_date:
 *                 type: string
 *                 format: date
 *               session_time:
 *                 type: string
 *               attendance_records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     enrollment_id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [present, absent, late, excused]
 *                     check_in_time:
 *                       type: string
 *                       format: time
 *                     notes:
 *                       type: string
 *     responses:
 *       201:
 *         description: Attendance recorded successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied
 */
router.post('/',
  auth,
  roleAuth(['admin', 'academic_staff']),
  [
    body('course_id').isInt(),
    body('session_date').isISO8601(),
    body('session_time').optional().isLength({ min: 1 }),
    body('attendance_records').isArray({ min: 1 }),
    body('attendance_records.*.enrollment_id').isInt(),
    body('attendance_records.*.status').isIn(['present', 'absent', 'late', 'excused']),
    body('attendance_records.*.check_in_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('attendance_records.*.notes').optional().isLength({ max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        course_id,
        session_date,
        session_time = '09:00',
        attendance_records
      } = req.body;

      // Verify instructor has access to this course
      if (req.user.role === 'academic_staff') {
        const courseCheck = await req.db.query(
          'SELECT instructor_id FROM courses WHERE id = $1',
          [course_id]
        );
        
        if (courseCheck.rows.length === 0) {
          return res.status(404).json({ message: 'Course not found' });
        }
        
        if (courseCheck.rows[0].instructor_id !== req.user.id) {
          return res.status(403).json({ message: 'Access denied to this course' });
        }
      }

      // Begin transaction
      await req.db.query('BEGIN');

      try {
        const recordedAttendance = [];

        for (const record of attendance_records) {
          const {
            enrollment_id,
            status,
            check_in_time,
            notes = ''
          } = record;

          // Check if attendance already exists for this session
          const existingAttendance = await req.db.query(`
            SELECT id FROM attendance 
            WHERE enrollment_id = $1 AND session_date = $2 AND session_time = $3
          `, [enrollment_id, session_date, session_time]);

          let result;
          if (existingAttendance.rows.length > 0) {
            // Update existing attendance
            const updateQuery = `
              UPDATE attendance SET
                status = $1,
                check_in_time = $2,
                notes = $3,
                recorded_by = $4,
                updated_at = CURRENT_TIMESTAMP
              WHERE id = $5
              RETURNING *
            `;

            result = await req.db.query(updateQuery, [
              status, check_in_time, notes, req.user.id,
              existingAttendance.rows[0].id
            ]);
          } else {
            // Create new attendance record
            const insertQuery = `
              INSERT INTO attendance (
                enrollment_id, session_date, session_time, status,
                check_in_time, notes, recorded_by
              ) VALUES ($1, $2, $3, $4, $5, $6, $7)
              RETURNING *
            `;

            result = await req.db.query(insertQuery, [
              enrollment_id, session_date, session_time, status,
              check_in_time, notes, req.user.id
            ]);
          }

          recordedAttendance.push(result.rows[0]);
        }

        // Commit transaction
        await req.db.query('COMMIT');

        logger.info(`Attendance recorded for course ${course_id} on ${session_date} by user ${req.user.id}`);

        res.status(201).json({
          message: 'Attendance recorded successfully',
          session: {
            course_id,
            session_date,
            session_time,
            total_records: recordedAttendance.length
          },
          attendance_records: recordedAttendance
        });

      } catch (error) {
        // Rollback transaction on error
        await req.db.query('ROLLBACK');
        throw error;
      }

    } catch (error) {
      logger.error('Error recording attendance:', error);
      res.status(500).json({ 
        message: 'Error recording attendance',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
