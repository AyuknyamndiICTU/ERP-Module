const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { logger } = require('../utils/logger');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Major = require('../models/Major');
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

    // Create new student with ICTU requirements (pending approval)
    const newStudent = await Student.create({
      matricule,
      firstName,
      lastName,
      email,
      phone: phoneNumber,
      dateOfBirth,
      regionOfOrigin,
      placeOfOrigin,
      gender,
      age,
      bloodGroup,
      address,
      emergencyContact,
      facultyId,
      departmentId,
      majorId,
      semester,
      studentType,
      level,
      enrollmentDate: new Date(),
      registrationYear,
      status: 'pending',
      registrationLocked: false
    });

    logger.info(`Public student registration ${matricule} submitted`);

    // Notify coordinators about new registration
    const faculty = await Faculty.findByPk(facultyId, {
      include: [{ model: User, as: 'coordinator' }]
    });
    const major = await Major.findByPk(majorId, {
      include: [{ model: User, as: 'coordinator' }]
    });

    // Create notifications for coordinators
    const notifications = [];
    if (faculty?.coordinator) {
      notifications.push({
        userId: faculty.coordinator.id,
        title: 'New Student Registration',
        message: `New student ${firstName} ${lastName} (${matricule}) has applied for ${faculty.name}`,
        type: 'info',
        category: 'academic',
        data: { studentId: newStudent.id, action: 'review_registration' }
      });
    }
    if (major?.coordinator && major.coordinator.id !== faculty?.coordinator?.id) {
      notifications.push({
        userId: major.coordinator.id,
        title: 'New Student Registration',
        message: `New student ${firstName} ${lastName} (${matricule}) has applied for ${major.name}`,
        type: 'info',
        category: 'academic',
        data: { studentId: newStudent.id, action: 'review_registration' }
      });
    }

    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
    }

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
    
    const departments = await Department.findAll({
      where: { facultyId, status: 'active' },
      attributes: ['id', 'name', 'code', 'description']
    });

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

module.exports = router;
