const express = require('express');
const router = express.Router();
const { InstallmentPlan, Installment, Student, FeeStructure, User } = require('../models');
const { body, validationResult, param, query } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const { sendFeePaymentReminderEmail } = require('../utils/emailService');
const { Op } = require('sequelize');

/**
 * @swagger
 * components:
 *   schemas:
 *     InstallmentPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         studentId:
 *           type: string
 *           format: uuid
 *         totalAmount:
 *           type: number
 *         numberOfInstallments:
 *           type: integer
 *         installmentAmount:
 *           type: number
 *         frequency:
 *           type: string
 *           enum: [monthly, quarterly, custom]
 *         status:
 *           type: string
 *           enum: [active, completed, overdue, cancelled]
 */

/**
 * @swagger
 * /api/installments/plans:
 *   post:
 *     summary: Create installment plan for student
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - feeStructureId
 *               - numberOfInstallments
 *               - frequency
 *             properties:
 *               studentId:
 *                 type: string
 *                 format: uuid
 *               feeStructureId:
 *                 type: string
 *                 format: uuid
 *               numberOfInstallments:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *               frequency:
 *                 type: string
 *                 enum: [monthly, quarterly, custom]
 *               customSchedule:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dueDate:
 *                       type: string
 *                       format: date
 *                     amount:
 *                       type: number
 *               startDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Installment plan created successfully
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Insufficient permissions
 */
router.post('/plans',
  authenticateToken,
  authorizeRoles(['admin', 'finance_user']),
  [
    body('studentId').isUUID().withMessage('Valid student ID is required'),
    body('feeStructureId').isUUID().withMessage('Valid fee structure ID is required'),
    body('numberOfInstallments').isInt({ min: 1, max: 12 }).withMessage('Number of installments must be between 1 and 12'),
    body('frequency').isIn(['monthly', 'quarterly', 'custom']).withMessage('Invalid frequency'),
    body('startDate').optional().isISO8601().withMessage('Invalid start date'),
    body('customSchedule').optional().isArray().withMessage('Custom schedule must be an array'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { 
        studentId, 
        feeStructureId, 
        numberOfInstallments, 
        frequency, 
        customSchedule, 
        startDate,
        notes 
      } = req.body;

      // Verify student exists
      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Verify fee structure exists
      const feeStructure = await FeeStructure.findByPk(feeStructureId);
      if (!feeStructure) {
        return res.status(404).json({ message: 'Fee structure not found' });
      }

      // Check if student already has an active plan for this fee structure
      const existingPlan = await InstallmentPlan.findOne({
        where: {
          studentId,
          feeStructureId,
          status: 'active'
        }
      });

      if (existingPlan) {
        return res.status(400).json({ 
          message: 'Student already has an active installment plan for this fee structure' 
        });
      }

      const totalAmount = parseFloat(feeStructure.totalAmount);
      let installmentAmount = totalAmount / numberOfInstallments;

      // Handle custom schedule
      if (frequency === 'custom' && customSchedule && customSchedule.length > 0) {
        const customTotal = customSchedule.reduce((sum, item) => sum + parseFloat(item.amount), 0);
        if (Math.abs(customTotal - totalAmount) > 0.01) {
          return res.status(400).json({ 
            message: 'Custom schedule amounts must equal total fee amount' 
          });
        }
      }

      // Create installment plan
      const planStartDate = startDate || new Date().toISOString().split('T')[0];
      
      const installmentPlan = await InstallmentPlan.create({
        studentId,
        feeStructureId,
        totalAmount,
        numberOfInstallments,
        installmentAmount,
        remainingAmount: totalAmount,
        startDate: planStartDate,
        frequency,
        customSchedule: frequency === 'custom' ? customSchedule : null,
        notes,
        createdBy: req.user.id
      });

      // Generate individual installments
      const installments = [];
      const startDateObj = new Date(planStartDate);

      for (let i = 1; i <= numberOfInstallments; i++) {
        let dueDate;
        let amount = installmentAmount;

        if (frequency === 'custom' && customSchedule) {
          const customItem = customSchedule[i - 1];
          dueDate = customItem.dueDate;
          amount = parseFloat(customItem.amount);
        } else {
          // Calculate due date based on frequency
          dueDate = new Date(startDateObj);
          if (frequency === 'monthly') {
            dueDate.setMonth(dueDate.getMonth() + (i - 1));
          } else if (frequency === 'quarterly') {
            dueDate.setMonth(dueDate.getMonth() + ((i - 1) * 3));
          }
        }

        // Adjust last installment for rounding differences
        if (i === numberOfInstallments && frequency !== 'custom') {
          const totalPreviousAmount = installmentAmount * (numberOfInstallments - 1);
          amount = totalAmount - totalPreviousAmount;
        }

        const installment = await Installment.create({
          installmentPlanId: installmentPlan.id,
          installmentNumber: i,
          amount,
          dueDate: dueDate.toISOString().split('T')[0]
        });

        installments.push(installment);
      }

      // Fetch complete plan with installments
      const completePlan = await InstallmentPlan.findByPk(installmentPlan.id, {
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'matricule', 'firstName', 'lastName', 'email']
          },
          {
            model: FeeStructure,
            as: 'feeStructure',
            attributes: ['id', 'name', 'academicYear', 'semester']
          },
          {
            model: Installment,
            as: 'installments',
            order: [['installmentNumber', 'ASC']]
          }
        ]
      });

      logger.info(`Installment plan created for student ${student.matricule} by user ${req.user.id}`);

      res.status(201).json({
        message: 'Installment plan created successfully',
        installmentPlan: completePlan
      });

    } catch (error) {
      logger.error('Error creating installment plan:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @swagger
 * /api/installments/plans:
 *   get:
 *     summary: Get installment plans with filtering
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, overdue, cancelled]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of installment plans
 */
router.get('/plans',
  authenticateToken,
  authorizeRoles(['admin', 'finance_user', 'student']),
  [
    query('studentId').optional().isUUID(),
    query('status').optional().isIn(['active', 'completed', 'overdue', 'cancelled']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { studentId, status, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // Build where clause
      const whereClause = {};
      
      if (studentId) {
        whereClause.studentId = studentId;
      }
      
      if (status) {
        whereClause.status = status;
      }

      // If user is a student, only show their own plans
      if (req.user.role === 'student') {
        const student = await Student.findOne({ where: { userId: req.user.id } });
        if (student) {
          whereClause.studentId = student.id;
        } else {
          return res.status(404).json({ message: 'Student profile not found' });
        }
      }

      const { count, rows: installmentPlans } = await InstallmentPlan.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'matricule', 'firstName', 'lastName', 'email']
          },
          {
            model: FeeStructure,
            as: 'feeStructure',
            attributes: ['id', 'name', 'academicYear', 'semester', 'totalAmount']
          },
          {
            model: Installment,
            as: 'installments',
            order: [['installmentNumber', 'ASC']]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        installmentPlans,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      });

    } catch (error) {
      logger.error('Error fetching installment plans:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @swagger
 * /api/installments/{installmentId}/pay:
 *   post:
 *     summary: Record installment payment
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: installmentId
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
 *             required:
 *               - amount
 *               - paymentMethod
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, bank_transfer, mobile_money, cheque, online]
 *               transactionReference:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment recorded successfully
 */
router.post('/:installmentId/pay',
  authenticateToken,
  authorizeRoles(['admin', 'finance_user']),
  [
    param('installmentId').isUUID().withMessage('Valid installment ID is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('paymentMethod').isIn(['cash', 'bank_transfer', 'mobile_money', 'cheque', 'online']).withMessage('Invalid payment method'),
    body('transactionReference').optional().isString(),
    body('notes').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { installmentId } = req.params;
      const { amount, paymentMethod, transactionReference, notes } = req.body;

      const installment = await Installment.findByPk(installmentId, {
        include: [
          {
            model: InstallmentPlan,
            as: 'installmentPlan',
            include: [
              {
                model: Student,
                as: 'student',
                attributes: ['id', 'matricule', 'firstName', 'lastName', 'email']
              }
            ]
          }
        ]
      });

      if (!installment) {
        return res.status(404).json({ message: 'Installment not found' });
      }

      const paidAmount = parseFloat(installment.paidAmount) || 0;
      const newPaidAmount = paidAmount + parseFloat(amount);
      const installmentAmount = parseFloat(installment.amount);

      if (newPaidAmount > installmentAmount) {
        return res.status(400).json({ 
          message: 'Payment amount exceeds remaining installment balance' 
        });
      }

      // Update installment
      let status = 'partial';
      if (newPaidAmount >= installmentAmount) {
        status = 'paid';
      }

      await installment.update({
        paidAmount: newPaidAmount,
        paidDate: new Date(),
        status,
        paymentMethod,
        transactionReference,
        notes,
        processedBy: req.user.id
      });

      // Update installment plan remaining amount
      const installmentPlan = installment.installmentPlan;
      const newRemainingAmount = parseFloat(installmentPlan.remainingAmount) - parseFloat(amount);
      
      let planStatus = installmentPlan.status;
      if (newRemainingAmount <= 0) {
        planStatus = 'completed';
      }

      await installmentPlan.update({
        remainingAmount: Math.max(0, newRemainingAmount),
        status: planStatus
      });

      logger.info(`Payment of ${amount} recorded for installment ${installmentId} by user ${req.user.id}`);

      res.json({
        message: 'Payment recorded successfully',
        installment: {
          id: installment.id,
          amount: installment.amount,
          paidAmount: newPaidAmount,
          status,
          remainingAmount: Math.max(0, installmentAmount - newPaidAmount)
        },
        installmentPlan: {
          id: installmentPlan.id,
          remainingAmount: Math.max(0, newRemainingAmount),
          status: planStatus
        }
      });

    } catch (error) {
      logger.error('Error recording payment:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @swagger
 * /api/installments/overdue:
 *   get:
 *     summary: Get overdue installments
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of overdue installments
 */
router.get('/overdue',
  authenticateToken,
  authorizeRoles(['admin', 'finance_user']),
  async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const overdueInstallments = await Installment.findAll({
        where: {
          dueDate: { [Op.lt]: today },
          status: { [Op.in]: ['pending', 'partial'] }
        },
        include: [
          {
            model: InstallmentPlan,
            as: 'installmentPlan',
            include: [
              {
                model: Student,
                as: 'student',
                attributes: ['id', 'matricule', 'firstName', 'lastName', 'email']
              },
              {
                model: FeeStructure,
                as: 'feeStructure',
                attributes: ['name', 'academicYear', 'semester']
              }
            ]
          }
        ],
        order: [['dueDate', 'ASC']]
      });

      // Update status to overdue
      await Installment.update(
        { status: 'overdue' },
        {
          where: {
            dueDate: { [Op.lt]: today },
            status: { [Op.in]: ['pending', 'partial'] }
          }
        }
      );

      res.json({
        overdueInstallments,
        count: overdueInstallments.length
      });

    } catch (error) {
      logger.error('Error fetching overdue installments:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @swagger
 * /api/installments/send-reminders:
 *   post:
 *     summary: Send payment reminders for upcoming/overdue installments
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               daysAhead:
 *                 type: integer
 *                 default: 7
 *                 description: Send reminders for installments due within this many days
 *     responses:
 *       200:
 *         description: Reminders sent successfully
 */
router.post('/send-reminders',
  authenticateToken,
  authorizeRoles(['admin', 'finance_user']),
  [
    body('daysAhead').optional().isInt({ min: 1, max: 30 }).withMessage('Days ahead must be between 1 and 30')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { daysAhead = 7 } = req.body;
      const today = new Date();
      const reminderDate = new Date();
      reminderDate.setDate(today.getDate() + daysAhead);

      const upcomingInstallments = await Installment.findAll({
        where: {
          dueDate: { 
            [Op.between]: [
              today.toISOString().split('T')[0],
              reminderDate.toISOString().split('T')[0]
            ]
          },
          status: { [Op.in]: ['pending', 'partial', 'overdue'] }
        },
        include: [
          {
            model: InstallmentPlan,
            as: 'installmentPlan',
            include: [
              {
                model: Student,
                as: 'student',
                attributes: ['id', 'matricule', 'firstName', 'lastName', 'email']
              },
              {
                model: FeeStructure,
                as: 'feeStructure',
                attributes: ['name', 'academicYear', 'semester']
              }
            ]
          }
        ]
      });

      let emailsSent = 0;
      let emailsFailed = 0;

      for (const installment of upcomingInstallments) {
        const student = installment.installmentPlan.student;
        const feeStructure = installment.installmentPlan.feeStructure;
        
        const installmentDetails = {
          amount: parseFloat(installment.amount) - parseFloat(installment.paidAmount || 0),
          dueDate: installment.dueDate,
          semester: `${feeStructure.academicYear} - ${feeStructure.semester}`
        };

        const emailResult = await sendFeePaymentReminderEmail(student, installmentDetails);
        
        if (emailResult.success) {
          emailsSent++;
        } else {
          emailsFailed++;
          logger.warn(`Failed to send reminder email to ${student.email}: ${emailResult.error}`);
        }
      }

      logger.info(`Payment reminders sent: ${emailsSent} successful, ${emailsFailed} failed`);

      res.json({
        message: 'Payment reminders processed',
        totalInstallments: upcomingInstallments.length,
        emailsSent,
        emailsFailed
      });

    } catch (error) {
      logger.error('Error sending payment reminders:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;
