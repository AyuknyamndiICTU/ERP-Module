const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { logger } = require('../utils/logger');
const Major = require('../models/Major');
const Course = require('../models/Course');
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/majors:
 *   get:
 *     summary: Get all majors
 *     tags: [Majors]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { level } = req.query;
    
    const whereClause = { status: 'active' };
    if (level) {
      whereClause.level = level;
    }

    const majors = await Major.findAll({
      where: whereClause,
      order: [['level', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      majors
    });
  } catch (error) {
    logger.error('Error fetching majors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching majors'
    });
  }
});

/**
 * @swagger
 * /api/majors:
 *   post:
 *     summary: Create new major
 *     tags: [Majors]
 */
router.post('/',
  authenticateToken,
  roleAuth(['admin', 'system_admin']),
  [
    body('name').notEmpty().withMessage('Major name is required'),
    body('code').notEmpty().withMessage('Major code is required'),
    body('level').isIn(['undergraduate', 'masters', 'phd']).withMessage('Valid level required'),
    body('description').optional().isLength({ max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, code, level, description, coordinatorId } = req.body;

      // Check for duplicate code
      const existingMajor = await Major.findOne({
        where: { code: code.toUpperCase() }
      });

      if (existingMajor) {
        return res.status(409).json({
          success: false,
          message: 'Major code already exists'
        });
      }

      const major = await Major.create({
        name,
        code: code.toUpperCase(),
        level,
        description,
        coordinatorId
      });

      logger.info(`Major ${name} (${level}) created by user ${req.user.id}`);

      res.status(201).json({
        success: true,
        message: 'Major created successfully',
        major
      });
    } catch (error) {
      logger.error('Error creating major:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating major'
      });
    }
  }
);

/**
 * @swagger
 * /api/majors/{id}/courses:
 *   get:
 *     summary: Get courses by major
 *     tags: [Majors]
 */
router.get('/:id/courses', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { semester, departmentId } = req.query;

    const whereClause = { 
      majorId: id,
      status: 'active'
    };
    
    if (semester) {
      whereClause.semester = semester;
    }
    
    if (departmentId) {
      whereClause.departmentId = departmentId;
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
 * /api/majors/{id}:
 *   put:
 *     summary: Update major
 *     tags: [Majors]
 */
router.put('/:id',
  authenticateToken,
  roleAuth(['admin', 'system_admin', 'major_coordinator']),
  [
    param('id').isInt().withMessage('Valid major ID required'),
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

      const major = await Major.findByPk(id);
      if (!major) {
        return res.status(404).json({
          success: false,
          message: 'Major not found'
        });
      }

      await major.update(updateData);

      logger.info(`Major ${id} updated by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Major updated successfully',
        major
      });
    } catch (error) {
      logger.error('Error updating major:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating major'
      });
    }
  }
);

module.exports = router;
