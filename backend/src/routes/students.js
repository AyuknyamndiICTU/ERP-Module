const express = require('express');
const router = express.Router();
const { Student, User, Faculty, Department, Major, Course, Notification } = require('../models');
const { body, validationResult, param, query } = require('express-validator');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { sendRegistrationApprovalEmail, sendRegistrationRejectionEmail } = require('../utils/emailService');
const { Op, sequelize } = require('sequelize');
const { sequelize: dbSequelize } = require('../config/database');
const { generateMatricule } = require('../utils/matriculeGenerator');

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

      // Build WHERE conditions for Sequelize
      const whereConditions = {};

      if (search) {
        whereConditions[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { studentId: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (status) {
        whereConditions.status = status;
      }

      if (program_id) {
        whereConditions.programId = program_id;
      }

      if (year_level) {
        whereConditions.yearLevel = year_level;
      }

      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count
      const total = await Student.count({
        where: whereConditions
      });

      // Get students with pagination
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

      logger.info(`Retrieved ${students.length} students for user ${req.user.id}`);

      res.json({
        students: students,
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
      const student = await Student.findByPk(id);

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // For now, return basic student information
      // TODO: Add relationships for enrollments, grades, and attendance when models are properly associated

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

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - first_name
 *               - last_name
 *               - email
 *               - date_of_birth
 *               - enrollment_date
 *             properties:
 *               student_id:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               enrollment_date:
 *                 type: string
 *                 format: date
 *               program_id:
 *                 type: integer
 *               year_level:
 *                 type: integer
 *               address:
 *                 type: object
 *               emergency_contact:
 *                 type: object
 *     responses:
 *       201:
 *         description: Student created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Student ID or email already exists
 */
router.post('/',
  authenticateToken,
  roleAuth(['admin', 'academic_staff']),
  [
    body('student_id').notEmpty().withMessage('Student ID is required'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('date_of_birth').isDate().withMessage('Valid date of birth is required'),
    body('enrollment_date').isDate().withMessage('Valid enrollment date is required'),
    body('program_id').optional().isInt(),
    body('year_level').optional().isInt({ min: 1, max: 4 }),
    body('gender').optional().isIn(['male', 'female', 'other'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        region_of_origin,
        place_of_origin,
        gender,
        age,
        blood_group,
        faculty_id,
        department_id,
        major_id,
        semester,
        student_type,
        level,
        enrollment_date
      } = req.body;

      // Generate ICTU matricule
      const registrationYear = new Date().getFullYear();
      const matricule = await generateMatricule(registrationYear);

      // Check for duplicate email
      const existingStudent = await Student.findOne({
        where: { email: email }
      });

      if (existingStudent) {
        return res.status(409).json({ 
          message: 'Email already exists' 
        });
      }

      // Convert level string to integer if needed
      const levelMap = {
        'undergraduate': 1,
        'masters': 2,
        'master': 2,
        'phd': 3
      };
      const levelInt = typeof level === 'string' ? (levelMap[level.toLowerCase()] || 1) : level;

      // Create new student with ICTU requirements (pending approval)
      // Use raw SQL to avoid Sequelize model association conflicts
      const studentId = require('crypto').randomUUID();
      await dbSequelize.query(`
        INSERT INTO students (
          id, matricule, student_id, first_name, last_name, email, phone,
          date_of_birth, region_of_origin, place_of_origin, gender, age, blood_group,
          address, faculty_id, department_id, major_id, semester, student_type,
          level, enrollment_date, registration_year, status, registration_locked,
          created_at, updated_at
        ) VALUES (
          :id, :matricule, :studentId, :firstName, :lastName, :email, :phone,
          :dateOfBirth, :regionOfOrigin, :placeOfOrigin, :gender, :age, :bloodGroup,
          :address, :facultyId, :departmentId, :majorId, :semester, :studentType,
          :level, :enrollmentDate, :registrationYear, :status, :registrationLocked,
          NOW(), NOW()
        )
      `, {
        replacements: {
          id: studentId,
          matricule,
          studentId: matricule,
          firstName: first_name,
          lastName: last_name,
          email,
          phone,
          dateOfBirth: date_of_birth,
          regionOfOrigin: region_of_origin,
          placeOfOrigin: place_of_origin,
          gender: typeof gender === 'string' ? gender.toLowerCase() : gender,
          age: age || null,
          bloodGroup: blood_group || null,
          address: JSON.stringify({
            ...(address || {}),
            emergencyContact: emergency_contact || null
          }),
          facultyId: faculty_id,
          departmentId: department_id,
          majorId: major_id,
          semester,
          studentType: student_type || 'regular',
          level: levelInt,
          enrollmentDate: enrollment_date || new Date(),
          registrationYear,
          status: 'pending',
          registrationLocked: false
        }
      });

      // Create a student object for response
      const newStudent = {
        id: studentId,
        matricule,
        firstName: first_name,
        lastName: last_name,
        email,
        status: 'pending'
      };

      logger.info(`Student ${matricule} created by user ${req.user.id}`);

      // Notify coordinators about new registration
      const faculty = await Faculty.findByPk(faculty_id, {
        include: [{ model: User, as: 'coordinator' }]
      });
      const major = await Major.findByPk(major_id, {
        include: [{ model: User, as: 'coordinator' }]
      });

      // Create notifications for coordinators
      const notifications = [];
      if (faculty?.coordinator) {
        notifications.push({
          userId: faculty.coordinator.id,
          title: 'New Student Registration',
          message: `New student ${first_name} ${last_name} (${matricule}) has applied for ${faculty.name}`,
          type: 'info',
          category: 'academic',
          data: { studentId: newStudent.id, action: 'review_registration' }
        });
      }
      if (major?.coordinator && major.coordinator.id !== faculty?.coordinator?.id) {
        notifications.push({
          userId: major.coordinator.id,
          title: 'New Student Registration',
          message: `New student ${first_name} ${last_name} (${matricule}) has applied for ${major.name}`,
          type: 'info',
          category: 'academic',
          data: { studentId: newStudent.id, action: 'review_registration' }
        });
      }

      if (notifications.length > 0) {
        await Notification.bulkCreate(notifications);
      }

      res.status(201).json({
        message: 'Registration submitted successfully. You will be contacted via email once your application is reviewed.',
        student: {
          id: newStudent.id,
          matricule: newStudent.matricule,
          firstName: newStudent.firstName,
          lastName: newStudent.lastName,
          email: newStudent.email,
          status: newStudent.status
        }
      });

    } catch (error) {
      logger.error('Error creating student:', error);
      res.status(500).json({ 
        message: 'Error creating student',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Update student by ID
 *     tags: [Students]
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               program_id:
 *                 type: integer
 *               year_level:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, inactive, graduated, suspended, withdrawn]
 *               address:
 *                 type: object
 *               emergency_contact:
 *                 type: object
 *     responses:
 *       200:
 *         description: Student updated successfully
 *       404:
 *         description: Student not found
 *       400:
 *         description: Validation error
 */
router.put('/:id',
  authenticateToken,
  roleAuth(['admin', 'academic_staff']),
  [
    param('id').isInt(),
    body('first_name').optional().notEmpty(),
    body('last_name').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('date_of_birth').optional().isDate(),
    body('program_id').optional().isInt(),
    body('year_level').optional().isInt({ min: 1, max: 4 }),
    body('gender').optional().isIn(['male', 'female', 'other']),
    body('status').optional().isIn(['active', 'inactive', 'graduated', 'suspended', 'withdrawn'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updateFields = req.body;

      // Check if student exists
      const existingStudent = await Student.findByPk(id);

      if (!existingStudent) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Build update object with proper field mapping
      const updateData = {};
      
      if (updateFields.first_name) updateData.firstName = updateFields.first_name;
      if (updateFields.last_name) updateData.lastName = updateFields.last_name;
      if (updateFields.email) updateData.email = updateFields.email;
      if (updateFields.phone) updateData.phone = updateFields.phone;
      if (updateFields.date_of_birth) updateData.dateOfBirth = updateFields.date_of_birth;
      if (updateFields.gender) updateData.gender = updateFields.gender;
      if (updateFields.program_id) updateData.programId = updateFields.program_id;
      if (updateFields.year_level) updateData.yearLevel = updateFields.year_level;
      if (updateFields.status) updateData.status = updateFields.status;
      if (updateFields.address) updateData.address = updateFields.address;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No valid fields to update' });
      }

      // Update student
      await existingStudent.update(updateData);
      const updatedStudent = await Student.findByPk(id);

      logger.info(`Student ${id} updated by user ${req.user.id}`);

      res.json({
        message: 'Student updated successfully',
        student: updatedStudent
      });

    } catch (error) {
      logger.error('Error updating student:', error);
      res.status(500).json({ 
        message: 'Error updating student',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Delete student by ID (soft delete)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *       404:
 *         description: Student not found
 */
router.delete('/:id',
  authenticateToken,
  roleAuth(['admin']),
  [param('id').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;

      // Check if student exists
      const existingStudent = await Student.findOne({
        where: {
          id: id,
          status: { [Op.ne]: 'deleted' }
        }
      });

      if (!existingStudent) {
        return res.status(404).json({ message: 'Student not found or already deleted' });
      }

      // Soft delete the student
      await existingStudent.update({ status: 'deleted' });
      
      const deletedStudent = {
        student_id: existingStudent.studentId,
        first_name: existingStudent.firstName,
        last_name: existingStudent.lastName
      };

      logger.info(`Student ${deletedStudent.student_id} deleted by user ${req.user.id}`);

      res.json({
        message: 'Student deleted successfully',
        student: deletedStudent
      });

    } catch (error) {
      logger.error('Error deleting student:', error);
      res.status(500).json({ 
        message: 'Error deleting student',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/students/{id}/approve:
 *   post:
 *     summary: Approve student registration (Coordinator only)
 *     tags: [Students]
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
 *         description: Student registration approved successfully
 *       403:
 *         description: Not authorized to approve this student
 *       404:
 *         description: Student not found
 */
router.post('/:id/approve',
  authenticateToken,
  roleAuth(['faculty_coordinator', 'major_coordinator']),
  [param('id').isUUID()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const coordinatorId = req.user.id;

      // Find the student
      const student = await Student.findByPk(id, {
        include: [
          { model: Faculty, as: 'faculty' },
          { model: Major, as: 'major' }
        ]
      });

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      if (student.status !== 'pending') {
        return res.status(400).json({ message: 'Student registration is not pending approval' });
      }

      // Check if coordinator has permission
      const hasPermission = 
        (student.faculty?.coordinatorId === coordinatorId) ||
        (student.major?.coordinatorId === coordinatorId);

      if (!hasPermission) {
        return res.status(403).json({
          message: 'You are not authorized to approve this student registration'
        });
      }

      // Create user account for the student
      const bcrypt = require('bcryptjs');
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const user = await User.create({
        email: student.email,
        password: hashedPassword,
        firstName: student.firstName,
        lastName: student.lastName,
        role: 'student',
        isActive: true
      });

      // Update student status and link to user
      await student.update({
        userId: user.id,
        status: 'active',
        registrationLocked: true
      });

      // Send notification to student
      await Notification.create({
        userId: user.id,
        title: 'Registration Approved',
        message: `Welcome to ICTU! Your registration has been approved. Your matricule is ${student.matricule}`,
        type: 'success',
        category: 'academic',
        data: { 
          matricule: student.matricule,
          tempPassword: tempPassword,
          action: 'login_credentials'
        }
      });

      // Send email notification to student
      const studentWithAssociations = await Student.findByPk(student.id, {
        include: [
          { model: Faculty, as: 'faculty' },
          { model: Department, as: 'department' },
          { model: Major, as: 'major' }
        ]
      });

      const emailResult = await sendRegistrationApprovalEmail(
        studentWithAssociations,
        { tempPassword }
      );

      if (!emailResult.success) {
        logger.warn(`Failed to send approval email to ${student.email}: ${emailResult.error}`);
      }

      logger.info(`Student registration ${student.matricule} approved by coordinator ${coordinatorId}`);

      res.json({
        message: 'Student registration approved successfully',
        student: {
          id: student.id,
          matricule: student.matricule,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          status: student.status
        },
        credentials: {
          email: student.email,
          tempPassword: tempPassword
        }
      });

    } catch (error) {
      logger.error('Error approving student registration:', error);
      res.status(500).json({ 
        message: 'Error approving student registration',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/students/{id}/reject:
 *   post:
 *     summary: Reject student registration (Coordinator only)
 *     tags: [Students]
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
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Student registration rejected successfully
 *       403:
 *         description: Not authorized to reject this student
 *       404:
 *         description: Student not found
 */
router.post('/:id/reject',
  authenticateToken,
  roleAuth(['faculty_coordinator', 'major_coordinator']),
  [
    param('id').isUUID(),
    body('reason').notEmpty().withMessage('Rejection reason is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { reason } = req.body;
      const coordinatorId = req.user.id;

      // Find the student
      const student = await Student.findByPk(id, {
        include: [
          { model: Faculty, as: 'faculty' },
          { model: Major, as: 'major' }
        ]
      });

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      if (student.status !== 'pending') {
        return res.status(400).json({ message: 'Student registration is not pending approval' });
      }

      // Check if coordinator has permission
      const hasPermission = 
        (student.faculty?.coordinatorId === coordinatorId) ||
        (student.major?.coordinatorId === coordinatorId);

      if (!hasPermission) {
        return res.status(403).json({
          message: 'You are not authorized to reject this student registration'
        });
      }

      // Update student status
      await student.update({
        status: 'inactive',
        registrationLocked: true
      });

      // Send email notification to student about rejection
      const emailResult = await sendRegistrationRejectionEmail(student, reason);

      if (!emailResult.success) {
        logger.warn(`Failed to send rejection email to ${student.email}: ${emailResult.error}`);
      }

      logger.info(`Student registration ${student.matricule} rejected by coordinator ${coordinatorId}. Reason: ${reason}`);

      res.json({
        message: 'Student registration rejected successfully',
        student: {
          id: student.id,
          matricule: student.matricule,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          status: student.status
        },
        reason: reason
      });

    } catch (error) {
      logger.error('Error rejecting student registration:', error);
      res.status(500).json({ 
        message: 'Error rejecting student registration',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/students/pending:
 *   get:
 *     summary: Get pending student registrations (Coordinator only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending student registrations
 */
router.get('/pending',
  authenticateToken,
  roleAuth(['faculty_coordinator', 'major_coordinator']),
  async (req, res) => {
    try {
      const coordinatorId = req.user.id;

      // Find students pending approval for this coordinator's faculty/major
      const students = await Student.findAll({
        where: { status: 'pending' },
        include: [
          { 
            model: Faculty, 
            as: 'faculty',
            where: { coordinatorId: coordinatorId },
            required: false
          },
          { 
            model: Major, 
            as: 'major',
            where: { coordinatorId: coordinatorId },
            required: false
          },
          { model: Department, as: 'department' }
        ]
      });

      // Filter students where coordinator has permission
      const filteredStudents = students.filter(student => 
        student.faculty?.coordinatorId === coordinatorId ||
        student.major?.coordinatorId === coordinatorId
      );

      res.json({
        message: 'Pending student registrations retrieved successfully',
        students: filteredStudents,
        count: filteredStudents.length
      });

    } catch (error) {
      logger.error('Error fetching pending student registrations:', error);
      res.status(500).json({ 
        message: 'Error fetching pending student registrations',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
