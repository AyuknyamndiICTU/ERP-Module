const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { logger } = require('../utils/logger');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { facultyId } = req.query;
    
    const whereClause = { status: 'active' };
    if (facultyId) {
      whereClause.facultyId = facultyId;
    }

    const departments = await Department.findAll({
      where: whereClause,
      include: [{
        model: Faculty,
        attributes: ['id', 'name', 'code']
      }],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      departments
    });
  } catch (error) {
    logger.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching departments'
    });
  }
});

/**
 * @swagger
 * /api/departments:
 *   post:
 *     summary: Create new department
 *     tags: [Departments]
 */
router.post('/',
  authenticateToken,
  roleAuth(['admin', 'system_admin', 'faculty_coordinator']),
  [
    body('name').notEmpty().withMessage('Department name is required'),
    body('code').notEmpty().withMessage('Department code is required'),
    body('facultyId').isInt().withMessage('Valid faculty ID required'),
    body('description').optional().isLength({ max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, code, facultyId, description, coordinatorId } = req.body;

      // Verify faculty exists
      const faculty = await Faculty.findByPk(facultyId);
      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found'
        });
      }

      // Check for duplicate code within faculty
      const existingDepartment = await Department.findOne({
        where: { 
          code: code.toUpperCase(),
          facultyId 
        }
      });

      if (existingDepartment) {
        return res.status(409).json({
          success: false,
          message: 'Department code already exists in this faculty'
        });
      }

      const department = await Department.create({
        name,
        code: code.toUpperCase(),
        facultyId,
        description,
        coordinatorId
      });

      logger.info(`Department ${name} created in faculty ${facultyId} by user ${req.user.id}`);

      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        department
      });
    } catch (error) {
      logger.error('Error creating department:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating department'
      });
    }
  }
);

/**
 * @swagger
 * /api/departments/{id}/courses:
 *   get:
 *     summary: Get courses by department and semester
 *     tags: [Departments]
 */
router.get('/:id/courses', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { semester, majorId } = req.query;

    const whereClause = { 
      departmentId: id,
      status: 'active'
    };
    
    if (semester) {
      whereClause.semester = semester;
    }
    
    if (majorId) {
      whereClause.majorId = majorId;
    }

    const courses = await Course.findAll({
      where: whereClause,
      order: [['year', 'ASC'], ['semester', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      courses
    });
  } catch (error) {
    logger.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
});

/**
 * @swagger
 * /api/departments/{id}:
 *   put:
 *     summary: Update department
 *     tags: [Departments]
 */
router.put('/:id',
  authenticateToken,
  roleAuth(['admin', 'system_admin', 'faculty_coordinator']),
  [
    param('id').isInt().withMessage('Valid department ID required'),
    body('name').optional().notEmpty(),
    body('description').optional().isLength({ max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updateData = req.body;

      const department = await Department.findByPk(id);
      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found'
        });
      }

      await department.update(updateData);

      logger.info(`Department ${id} updated by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Department updated successfully',
        department
      });
    } catch (error) {
      logger.error('Error updating department:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating department'
      });
    }
  }
);

module.exports = router;
