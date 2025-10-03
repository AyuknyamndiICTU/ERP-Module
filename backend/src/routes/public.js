const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { sequelize } = require('../config/database');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Major = require('../models/Major');
const Course = require('../models/Course');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateMatricule } = require('../utils/matriculeGenerator');

/**
 * @swagger
 * /api/public/register:
 *   post:
 *     summary: Public student registration (no authentication required)
 *     tags: [Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - dateOfBirth
 *               - gender
 *               - regionOfOrigin
 *               - placeOfOrigin
 *               - facultyId
 *               - departmentId
 *               - majorId
 *               - level
 *               - semester
 *               - phoneNumber
 *               - emergencyContact
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               age:
 *                 type: integer
 *               bloodGroup:
 *                 type: string
 *               regionOfOrigin:
 *                 type: string
 *               placeOfOrigin:
 *                 type: string
 *               address:
 *                 type: object
 *               phoneNumber:
 *                 type: string
 *               facultyId:
 *                 type: string
 *                 format: uuid
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *               majorId:
 *                 type: string
 *                 format: uuid
 *               semester:
 *                 type: integer
 *               level:
 *                 type: string
 *               studentType:
 *                 type: string
 *                 enum: [regular, transfer]
 *               selectedCourses:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               previousEducation:
 *                 type: string
 *               emergencyContact:
 *                 type: object
 *     responses:
 *       201:
 *         description: Registration submitted successfully
 *       409:
 *         description: Email already exists
 */
router.post('/register', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('dateOfBirth').isDate().withMessage('Valid date of birth is required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
  body('regionOfOrigin').notEmpty().withMessage('Region of origin is required'),
  body('placeOfOrigin').notEmpty().withMessage('Place of origin is required'),
  body('facultyId').isUUID().withMessage('Valid faculty ID is required'),
  body('departmentId').isUUID().withMessage('Valid department ID is required'),
  body('majorId').isUUID().withMessage('Valid major ID is required'),
  body('semester').isInt({ min: 1, max: 2 }).withMessage('Valid semester is required'),
  body('level').notEmpty().withMessage('Level is required'),
  body('studentType').optional().isIn(['regular', 'transfer']),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('emergencyContact.name').notEmpty().withMessage('Emergency contact name is required'),
  body('emergencyContact.phoneNumber').notEmpty().withMessage('Emergency contact phone is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      email,
      dateOfBirth,
      gender,
      age,
      bloodGroup,
      regionOfOrigin,
      placeOfOrigin,
      address,
      phoneNumber,
      facultyId,
      departmentId,
      majorId,
      semester,
      level,
      studentType = 'regular',
      selectedCourses = [],
      previousEducation,
      emergencyContact
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

    // Convert level string to integer
    const levelMap = {
      'undergraduate': 1,
      'masters': 2,
      'master': 2,
      'phd': 3
    };
    const levelInt = levelMap[level.toLowerCase()] || 1;

    // Create new student using raw SQL to bypass Sequelize associations
    const studentId = require('crypto').randomUUID();
    await sequelize.query(`
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
        firstName,
        lastName,
        email,
        phone: phoneNumber,
        dateOfBirth,
        regionOfOrigin,
        placeOfOrigin,
        gender: gender.toLowerCase(),
        age: age || null,
        bloodGroup: bloodGroup || null,
        address: JSON.stringify({
          ...(address || {}),
          emergencyContact: emergencyContact || null
        }),
        facultyId,
        departmentId,
        majorId,
        semester,
        studentType: studentType || 'regular',
        level: levelInt,
        enrollmentDate: new Date(),
        registrationYear,
        status: 'pending',
        registrationLocked: false
      }
    });

    // Create a simple student object for the response
    const newStudent = {
      id: studentId,
      matricule,
      firstName,
      lastName,
      email,
      status: 'pending'
    };

    logger.info(`Public student registration ${matricule} submitted`);

    // Skip notifications for now to avoid potential issues
    logger.info('Skipping coordinator notifications for debugging');

    res.status(201).json({
      message: 'Registration submitted successfully. You will be contacted via email once your application is reviewed by the coordinators.',
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
    logger.error('Error in public student registration:', error);
    res.status(500).json({ 
      message: 'Error submitting registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/public/faculties:
 *   get:
 *     summary: Get all faculties (public access)
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: List of faculties
 */
router.get('/faculties', async (req, res) => {
  try {
    const faculties = await Faculty.findAll({
      where: { status: 'active' },
      attributes: ['id', 'name', 'code', 'description']
    });

    res.json({
      message: 'Faculties retrieved successfully',
      faculties
    });
  } catch (error) {
    logger.error('Error fetching public faculties:', error);
    res.status(500).json({ 
      message: 'Error fetching faculties',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/public/faculties/{facultyId}/departments:
 *   get:
 *     summary: Get departments by faculty (public access)
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: facultyId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of departments
 */
router.get('/faculties/:facultyId/departments', async (req, res) => {
  try {
    const { facultyId } = req.params;
    
    // Check if faculty_id column exists in departments table
    let departments;
    try {
      // Try to query with facultyId first
      departments = await Department.findAll({
        where: { facultyId, status: 'active' },
        attributes: ['id', 'name', 'code', 'description']
      });
    } catch (columnError) {
      // If faculty_id column doesn't exist, return all active departments as fallback
      logger.warn('faculty_id column not found in departments table, returning all departments');
      departments = await Department.findAll({
        where: { status: 'active' },
        attributes: ['id', 'name', 'code', 'description']
      });
    }

    res.json({
      message: 'Departments retrieved successfully',
      departments
    });
  } catch (error) {
    logger.error('Error fetching public departments:', error);
    res.status(500).json({ 
      message: 'Error fetching departments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/public/majors:
 *   get:
 *     summary: Get all majors (public access)
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: List of majors
 */
router.get('/majors', async (req, res) => {
  try {
    const majors = await Major.findAll({
      where: { status: 'active' },
      attributes: ['id', 'name', 'code', 'level', 'description']
    });

    res.json({
      message: 'Majors retrieved successfully',
      majors
    });
  } catch (error) {
    logger.error('Error fetching public majors:', error);
    res.status(500).json({ 
      message: 'Error fetching majors',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/public/courses:
 *   get:
 *     summary: Get courses by department and semester (public access)
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: semester
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           default: active
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get('/courses', async (req, res) => {
  try {
    const { departmentId, semester, status = 'active' } = req.query;
    
    // Build WHERE conditions
    const whereConditions = { status };
    
    // Filter by semester if provided
    if (semester) {
      whereConditions.semester = parseInt(semester);
    }
    
    // Filter by department if departmentId is provided
    if (departmentId) {
      try {
        const department = await Department.findByPk(departmentId);
        if (department) {
          whereConditions.department = department.name;
        }
      } catch (deptError) {
        logger.warn('Department not found for filtering:', departmentId);
      }
    }
    
    // Get courses
    const courses = await Course.findAll({
      where: whereConditions,
      attributes: ['id', 'courseCode', 'courseName', 'description', 'credits', 'semester', 'department'],
      order: [['courseCode', 'ASC']]
    });

    res.json({
      message: 'Courses retrieved successfully',
      courses
    });
  } catch (error) {
    logger.error('Error fetching public courses:', error);
    res.status(500).json({ 
      message: 'Error fetching courses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
