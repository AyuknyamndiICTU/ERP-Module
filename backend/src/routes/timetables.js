const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { logger } = require('../utils/logger');
const Timetable = require('../models/Timetable');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const Major = require('../models/Major');
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/timetables:
 *   get:
 *     summary: Get timetables by faculty and major
 *     tags: [Timetables]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { facultyId, majorId, semester, academicYear } = req.query;
    
    const whereClause = { status: 'active' };
    if (facultyId) whereClause.facultyId = facultyId;
    if (majorId) whereClause.majorId = majorId;
    if (semester) whereClause.semester = semester;
    if (academicYear) whereClause.academicYear = academicYear;

    const timetables = await Timetable.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          attributes: ['id', 'code', 'name', 'credits']
        },
        {
          model: Faculty,
          attributes: ['id', 'name', 'code']
        },
        {
          model: Major,
          attributes: ['id', 'name', 'level']
        }
      ],
      order: [
        ['dayOfWeek', 'ASC'],
        ['startTime', 'ASC']
      ]
    });

    // Group by day of week for better frontend display
    const groupedTimetable = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    };

    timetables.forEach(entry => {
      groupedTimetable[entry.dayOfWeek].push(entry);
    });

    res.json({
      success: true,
      timetable: groupedTimetable,
      totalEntries: timetables.length
    });
  } catch (error) {
    logger.error('Error fetching timetables:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timetables'
    });
  }
});

/**
 * @swagger
 * /api/timetables:
 *   post:
 *     summary: Create timetable entry
 *     tags: [Timetables]
 */
router.post('/',
  authenticateToken,
  roleAuth(['admin', 'faculty_coordinator', 'major_coordinator']),
  [
    body('courseId').isInt().withMessage('Valid course ID required'),
    body('facultyId').isInt().withMessage('Valid faculty ID required'),
    body('majorId').isInt().withMessage('Valid major ID required'),
    body('semester').isInt({ min: 1, max: 2 }).withMessage('Valid semester required'),
    body('academicYear').notEmpty().withMessage('Academic year required'),
    body('dayOfWeek').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required (HH:MM)'),
    body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time required (HH:MM)'),
    body('lecturerId').isInt().withMessage('Valid lecturer ID required'),
    body('hall').notEmpty().withMessage('Hall is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        courseId,
        facultyId,
        majorId,
        semester,
        academicYear,
        dayOfWeek,
        startTime,
        endTime,
        lecturerId,
        hall,
        isOnline,
        notes
      } = req.body;

      // Check for time conflicts
      const conflictCheck = await Timetable.findOne({
        where: {
          facultyId,
          majorId,
          semester,
          academicYear,
          dayOfWeek,
          status: 'active',
          [Op.or]: [
            {
              startTime: {
                [Op.between]: [startTime, endTime]
              }
            },
            {
              endTime: {
                [Op.between]: [startTime, endTime]
              }
            },
            {
              [Op.and]: [
                { startTime: { [Op.lte]: startTime } },
                { endTime: { [Op.gte]: endTime } }
              ]
            }
          ]
        }
      });

      if (conflictCheck) {
        return res.status(409).json({
          success: false,
          message: 'Time slot conflict detected'
        });
      }

      const timetableEntry = await Timetable.create({
        courseId,
        facultyId,
        majorId,
        semester,
        academicYear,
        dayOfWeek,
        startTime,
        endTime,
        lecturerId,
        hall: isOnline ? 'Online' : hall,
        isOnline: isOnline || false,
        notes
      });

      logger.info(`Timetable entry created for course ${courseId} by user ${req.user.id}`);

      res.status(201).json({
        success: true,
        message: 'Timetable entry created successfully',
        timetableEntry
      });
    } catch (error) {
      logger.error('Error creating timetable entry:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating timetable entry'
      });
    }
  }
);

/**
 * @swagger
 * /api/timetables/{id}:
 *   put:
 *     summary: Update timetable entry
 *     tags: [Timetables]
 */
router.put('/:id',
  authenticateToken,
  roleAuth(['admin', 'faculty_coordinator', 'major_coordinator']),
  [
    param('id').isInt().withMessage('Valid timetable ID required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updateData = req.body;

      const timetableEntry = await Timetable.findByPk(id);
      if (!timetableEntry) {
        return res.status(404).json({
          success: false,
          message: 'Timetable entry not found'
        });
      }

      // Handle online course hall assignment
      if (updateData.isOnline) {
        updateData.hall = 'Online';
      }

      await timetableEntry.update(updateData);

      logger.info(`Timetable entry ${id} updated by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Timetable entry updated successfully',
        timetableEntry
      });
    } catch (error) {
      logger.error('Error updating timetable entry:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating timetable entry'
      });
    }
  }
);

/**
 * @swagger
 * /api/timetables/{id}:
 *   delete:
 *     summary: Delete timetable entry
 *     tags: [Timetables]
 */
router.delete('/:id',
  authenticateToken,
  roleAuth(['admin', 'faculty_coordinator', 'major_coordinator']),
  async (req, res) => {
    try {
      const { id } = req.params;

      const timetableEntry = await Timetable.findByPk(id);
      if (!timetableEntry) {
        return res.status(404).json({
          success: false,
          message: 'Timetable entry not found'
        });
      }

      await timetableEntry.update({ status: 'cancelled' });

      logger.info(`Timetable entry ${id} deleted by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Timetable entry deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting timetable entry:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting timetable entry'
      });
    }
  }
);

module.exports = router;
