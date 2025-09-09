const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { logger } = require('../utils/logger');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/faculties:
 *   get:
 *     summary: Get all faculties
 *     tags: [Faculties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Faculties retrieved successfully
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const faculties = await Faculty.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      faculties
    });
  } catch (error) {
    logger.error('Error fetching faculties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching faculties'
    });
  }
});

/**
 * @swagger
 * /api/faculties:
 *   post:
 *     summary: Create new faculty
 *     tags: [Faculties]
 *     security:
 *       - bearerAuth: []
 */
router.post('/',
  authenticateToken,
  roleAuth(['admin', 'system_admin']),
  [
    body('name').notEmpty().withMessage('Faculty name is required'),
    body('code').notEmpty().withMessage('Faculty code is required'),
    body('description').optional().isLength({ max: 500 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, code, description, coordinatorId } = req.body;

      // Check for duplicate code
      const existingFaculty = await Faculty.findOne({
        where: { code: code.toUpperCase() }
      });

      if (existingFaculty) {
        return res.status(409).json({
          success: false,
          message: 'Faculty code already exists'
        });
      }

      const faculty = await Faculty.create({
        name,
        code: code.toUpperCase(),
        description,
        coordinatorId
      });

      logger.info(`Faculty ${name} created by user ${req.user.id}`);

      res.status(201).json({
        success: true,
        message: 'Faculty created successfully',
        faculty
      });
    } catch (error) {
      logger.error('Error creating faculty:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating faculty'
      });
    }
  }
);

/**
 * @swagger
 * /api/faculties/{id}:
 *   put:
 *     summary: Update faculty
 *     tags: [Faculties]
 */
router.put('/:id',
  authenticateToken,
  roleAuth(['admin', 'system_admin', 'faculty_coordinator']),
  [
    param('id').isInt().withMessage('Valid faculty ID required'),
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

      const faculty = await Faculty.findByPk(id);
      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: 'Faculty not found'
        });
      }

      await faculty.update(updateData);

      logger.info(`Faculty ${id} updated by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Faculty updated successfully',
        faculty
      });
    } catch (error) {
      logger.error('Error updating faculty:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating faculty'
      });
    }
  }
);

/**
 * @swagger
 * /api/faculties/{id}/departments:
 *   get:
 *     summary: Get departments by faculty
 *     tags: [Faculties]
 */
router.get('/:id/departments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const departments = await Department.findAll({
      where: { 
        facultyId: id,
        status: 'active'
      },
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

module.exports = router;
