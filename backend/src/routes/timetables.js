const express = require('express');
const router = express.Router();
const { body, validationResult, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { logger } = require('../utils/logger');
const Timetable = require('../models/Timetable');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const Major = require('../models/Major');
const User = require('../models/User');
const { Op } = require('sequelize');

/**
 * @swagger
 * components:
 *   schemas:
 *     Timetable:
 *       type: object
 *       required:
 *         - courseId
 *         - facultyId
 *         - majorId
 *         - semester
 *         - academicYear
 *         - dayOfWeek
 *         - startTime
 *         - endTime
 *         - lecturerId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         courseId:
 *           type: string
 *           format: uuid
 *         facultyId:
 *           type: string
 *           format: uuid
 *         majorId:
 *           type: string
 *           format: uuid
 *         semester:
 *           type: integer
 *           enum: [1, 2]
 *         academicYear:
 *           type: string
 *         dayOfWeek:
 *           type: string
 *           enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *         startTime:
 *           type: string
 *           format: time
 *         endTime:
 *           type: string
 *           format: time
 *         lecturerId:
 *           type: string
 *           format: uuid
 *         hall:
 *           type: string
 *           default: TBA
 *         isOnline:
 *           type: boolean
 *           default: false
 *         status:
 *           type: string
 *           enum: [active, cancelled, rescheduled]
 *           default: active
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /api/timetables:
 *   get:
 *     summary: Get timetables with filtering
 *     tags: [Timetables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: facultyId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: majorId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: semester
 *         schema:
 *           type: integer
 *           enum: [1, 2]
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *       - in: query
 *         name: dayOfWeek
 *         schema:
 *           type: string
 *           enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *     responses:
 *       200:
 *         description: List of timetables
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timetables:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Timetable'
 */
router.get('/',
  authenticateToken,
  [
    query('facultyId').optional().isUUID(),
    query('majorId').optional().isUUID(),
    query('semester').optional().isInt({ min: 1, max: 2 }),
    query('academicYear').optional().isString(),
    query('dayOfWeek').optional().isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        facultyId,
        majorId,
        semester,
        academicYear = new Date().getFullYear().toString(),
        dayOfWeek
      } = req.query;

      // Build WHERE conditions
      const whereConditions = { academicYear };

      if (facultyId) whereConditions.facultyId = facultyId;
      if (majorId) whereConditions.majorId = majorId;
      if (semester) whereConditions.semester = semester;
      if (dayOfWeek) whereConditions.dayOfWeek = dayOfWeek;

      // Get timetables with related data
      const timetables = await Timetable.findAll({
        where: whereConditions,
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['courseCode', 'courseName', 'credits']
          },
          {
            model: User,
            as: 'lecturer',
            attributes: ['firstName', 'lastName', 'email']
          },
          {
            model: Faculty,
            as: 'faculty',
            attributes: ['name', 'code']
          },
          {
            model: Major,
            as: 'major',
            attributes: ['name', 'level']
          }
        ],
        order: [
          ['dayOfWeek', 'ASC'],
          ['startTime', 'ASC']
        ]
      });

      logger.info(`Retrieved ${timetables.length} timetables for user ${req.user.id}`);

      res.json({
        timetables,
        filters: {
          facultyId,
          majorId,
          semester,
          academicYear,
          dayOfWeek
        }
      });

    } catch (error) {
      logger.error('Error fetching timetables:', error);
      res.status(500).json({
        message: 'Error fetching timetables',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/timetables:
 *   post:
 *     summary: Create a new timetable entry (Coordinator only)
 *     tags: [Timetables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - facultyId
 *               - majorId
 *               - semester
 *               - academicYear
 *               - dayOfWeek
 *               - startTime
 *               - endTime
 *               - lecturerId
 *             properties:
 *               courseId:
 *                 type: string
 *                 format: uuid
 *               facultyId:
 *                 type: string
 *                 format: uuid
 *               majorId:
 *                 type: string
 *                 format: uuid
 *               semester:
 *                 type: integer
 *                 enum: [1, 2]
 *               academicYear:
 *                 type: string
 *               dayOfWeek:
 *                 type: string
 *                 enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *               lecturerId:
 *                 type: string
 *                 format: uuid
 *               hall:
 *                 type: string
 *                 default: TBA
 *               isOnline:
 *                 type: boolean
 *                 default: false
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Timetable entry created successfully
 *       400:
 *         description: Validation error or scheduling conflict
 *       403:
 *         description: Not authorized to create timetable for this faculty/major
 */
router.post('/',
  authenticateToken,
  roleAuth(['faculty_coordinator', 'major_coordinator']),
  [
    body('courseId').isUUID().withMessage('Valid course ID is required'),
    body('facultyId').isUUID().withMessage('Valid faculty ID is required'),
    body('majorId').isUUID().withMessage('Valid major ID is required'),
    body('semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
    body('academicYear').notEmpty().withMessage('Academic year is required'),
    body('dayOfWeek').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).withMessage('Valid day of week is required'),
    body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required (HH:MM)'),
    body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required (HH:MM)'),
    body('lecturerId').isUUID().withMessage('Valid lecturer ID is required'),
    body('hall').optional().isString(),
    body('isOnline').optional().isBoolean(),
    body('notes').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const coordinatorId = req.user.id;
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
        hall = 'TBA',
        isOnline = false,
        notes
      } = req.body;

      // Check if coordinator has permission for this faculty/major
      const faculty = await Faculty.findByPk(facultyId);
      if (!faculty || faculty.coordinatorId !== coordinatorId) {
        return res.status(403).json({
          message: 'You are not authorized to create timetables for this faculty'
        });
      }

      // Check for scheduling conflicts
      const conflict = await Timetable.findOne({
        where: {
          lecturerId,
          dayOfWeek,
          academicYear,
          [Op.or]: [
            {
              [Op.and]: [
                { startTime: { [Op.lt]: endTime } },
                { endTime: { [Op.gt]: startTime } }
              ]
            }
          ]
        }
      });

      if (conflict) {
        return res.status(400).json({
          message: 'Scheduling conflict detected for this lecturer at the specified time'
        });
      }

      // Check hall/room conflict if not online
      if (!isOnline && hall !== 'TBA') {
        const hallConflict = await Timetable.findOne({
          where: {
            hall,
            dayOfWeek,
            academicYear,
            isOnline: false,
            [Op.or]: [
              {
                [Op.and]: [
                  { startTime: { [Op.lt]: endTime } },
                  { endTime: { [Op.gt]: startTime } }
                ]
              }
            ]
          }
        });

        if (hallConflict) {
          return res.status(400).json({
            message: 'Hall/room is already booked at the specified time'
          });
        }
      }

      // Create timetable entry
      const timetable = await Timetable.create({
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
        notes,
        status: 'active'
      });

      logger.info(`Timetable entry created by coordinator ${coordinatorId}`);

      res.status(201).json({
        message: 'Timetable entry created successfully',
        timetable
      });

    } catch (error) {
      logger.error('Error creating timetable:', error);
      res.status(500).json({
        message: 'Error creating timetable',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/timetables/{id}:
 *   put:
 *     summary: Update timetable entry (Coordinator only)
 *     tags: [Timetables]
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
 *               dayOfWeek:
 *                 type: string
 *                 enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *               startTime:
 *                 type: string
 *                 format: time
 *               endTime:
 *                 type: string
 *                 format: time
 *               lecturerId:
 *                 type: string
 *                 format: uuid
 *               hall:
 *                 type: string
 *               isOnline:
 *                 type: boolean
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, cancelled, rescheduled]
 *     responses:
 *       200:
 *         description: Timetable entry updated successfully
 *       403:
 *         description: Not authorized to update this timetable
 *       404:
 *         description: Timetable entry not found
 */
router.put('/:id',
  authenticateToken,
  roleAuth(['faculty_coordinator', 'major_coordinator']),
  [
    param('id').isUUID(),
    body('dayOfWeek').optional().isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('lecturerId').optional().isUUID(),
    body('hall').optional().isString(),
    body('isOnline').optional().isBoolean(),
    body('notes').optional().isString(),
    body('status').optional().isIn(['active', 'cancelled', 'rescheduled'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const coordinatorId = req.user.id;
      const updateData = req.body;

      // Find timetable entry
      const timetable = await Timetable.findByPk(id);
      if (!timetable) {
        return res.status(404).json({ message: 'Timetable entry not found' });
      }

      // Check if coordinator has permission for this faculty
      const faculty = await Faculty.findByPk(timetable.facultyId);
      if (!faculty || faculty.coordinatorId !== coordinatorId) {
        return res.status(403).json({
          message: 'You are not authorized to update timetables for this faculty'
        });
      }

      // Check for conflicts if time-related fields are being updated
      if (updateData.startTime || updateData.endTime || updateData.dayOfWeek || updateData.lecturerId) {
        const checkData = {
          lecturerId: updateData.lecturerId || timetable.lecturerId,
          dayOfWeek: updateData.dayOfWeek || timetable.dayOfWeek,
          academicYear: timetable.academicYear,
          startTime: updateData.startTime || timetable.startTime,
          endTime: updateData.endTime || timetable.endTime
        };

        const conflict = await Timetable.findOne({
          where: {
            lecturerId: checkData.lecturerId,
            dayOfWeek: checkData.dayOfWeek,
            academicYear: checkData.academicYear,
            id: { [Op.ne]: id }, // Exclude current entry
            [Op.or]: [
              {
                [Op.and]: [
                  { startTime: { [Op.lt]: checkData.endTime } },
                  { endTime: { [Op.gt]: checkData.startTime } }
                ]
              }
            ]
          }
        });

        if (conflict) {
          return res.status(400).json({
            message: 'Scheduling conflict detected for this lecturer at the specified time'
          });
        }
      }

      // Update timetable entry
      await timetable.update(updateData);

      logger.info(`Timetable entry ${id} updated by coordinator ${coordinatorId}`);

      res.json({
        message: 'Timetable entry updated successfully',
        timetable
      });

    } catch (error) {
      logger.error('Error updating timetable:', error);
      res.status(500).json({
        message: 'Error updating timetable',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/timetables/{id}:
 *   delete:
 *     summary: Delete timetable entry (Coordinator only)
 *     tags: [Timetables]
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
 *         description: Timetable entry deleted successfully
 *       403:
 *         description: Not authorized to delete this timetable
 *       404:
 *         description: Timetable entry not found
 */
router.delete('/:id',
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

      // Find timetable entry
      const timetable = await Timetable.findByPk(id);
      if (!timetable) {
        return res.status(404).json({ message: 'Timetable entry not found' });
      }

      // Check if coordinator has permission for this faculty
      const faculty = await Faculty.findByPk(timetable.facultyId);
      if (!faculty || faculty.coordinatorId !== coordinatorId) {
        return res.status(403).json({
          message: 'You are not authorized to delete timetables for this faculty'
        });
      }

      // Delete timetable entry
      await timetable.destroy();

      logger.info(`Timetable entry ${id} deleted by coordinator ${coordinatorId}`);

      res.json({
        message: 'Timetable entry deleted successfully'
      });

    } catch (error) {
      logger.error('Error deleting timetable:', error);
      res.status(500).json({
        message: 'Error deleting timetable',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
