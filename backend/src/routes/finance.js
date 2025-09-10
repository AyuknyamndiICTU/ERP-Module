const express = require('express');
const router = express.Router();
const { body, validationResult, param, query } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { logger } = require('../utils/logger');
const FeeInstallment = require('../models/FeeInstallment');
const Student = require('../models/Student');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');

/**
 * @swagger
 * components:
 *   schemas:
 *     FeeInstallment:
 *       type: object
 *       required:
 *         - studentId
 *         - academicYear
 *         - semester
 *         - installmentNumber
 *         - totalInstallments
 *         - amount
 *         - dueDate
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         studentId:
 *           type: string
 *           format: uuid
 *         academicYear:
 *           type: string
 *         semester:
 *           type: integer
 *           enum: [1, 2]
 *         installmentNumber:
 *           type: integer
 *         totalInstallments:
 *           type: integer
 *         amount:
 *           type: number
 *           format: float
 *         dueDate:
 *           type: string
 *           format: date
 *         paidAmount:
 *           type: number
 *           format: float
 *           default: 0
 *         paidDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [pending, partial, paid, overdue, waived]
 *         paymentMethod:
 *           type: string
 *           enum: [cash, bank_transfer, mobile_money, card, cheque]
 *         transactionReference:
 *           type: string
 *         notes:
 *           type: string
 */

/**
 * @swagger
 * /api/finance/installments:
 *   get:
 *     summary: Get fee installments with filtering
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
 *         name: academicYear
 *         schema:
 *           type: string
 *       - in: query
 *         name: semester
 *         schema:
 *           type: integer
 *           enum: [1, 2]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, partial, paid, overdue, waived]
 *       - in: query
 *         name: overdue
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of fee installments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 installments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FeeInstallment'
 */
router.get('/installments',
  authenticateToken,
  [
    query('studentId').optional().isUUID(),
    query('academicYear').optional().isString(),
    query('semester').optional().isInt({ min: 1, max: 2 }),
    query('status').optional().isIn(['pending', 'partial', 'paid', 'overdue', 'waived']),
    query('overdue').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        studentId,
        academicYear = new Date().getFullYear().toString(),
        semester,
        status,
        overdue
      } = req.query;

      const userId = req.user.id;
      const userRole = req.user.role;

      // Build WHERE conditions
      const whereConditions = { academicYear };

      if (studentId) whereConditions.studentId = studentId;
      if (semester) whereConditions.semester = semester;
      if (status) whereConditions.status = status;

      // Role-based access control
      if (userRole === 'student') {
        whereConditions.studentId = userId;
      }

      // Filter overdue installments
      if (overdue === 'true') {
        whereConditions.dueDate = { [Op.lt]: new Date() };
        whereConditions.status = { [Op.in]: ['pending', 'partial'] };
      }

      // Get installments with related data
      const installments = await FeeInstallment.findAll({
        where: whereConditions,
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['matricule', 'firstName', 'lastName', 'email']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['firstName', 'lastName'],
            required: false
          }
        ],
        order: [
          ['studentId', 'ASC'],
          ['installmentNumber', 'ASC']
        ]
      });

      logger.info(`Retrieved ${installments.length} fee installments for user ${userId}`);

      res.json({
        installments,
        filters: {
          studentId,
          academicYear,
          semester,
          status,
          overdue
        }
      });

    } catch (error) {
      logger.error('Error fetching fee installments:', error);
      res.status(500).json({
        message: 'Error fetching fee installments',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/finance/installments:
 *   post:
 *     summary: Create fee installments for a student (Finance/Admin only)
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
 *               - academicYear
 *               - semester
 *               - totalAmount
 *               - numberOfInstallments
 *               - firstDueDate
 *             properties:
 *               studentId:
 *                 type: string
 *                 format: uuid
 *               academicYear:
 *                 type: string
 *               semester:
 *                 type: integer
 *                 enum: [1, 2]
 *               totalAmount:
 *                 type: number
 *                 format: float
 *               numberOfInstallments:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *               firstDueDate:
 *                 type: string
 *                 format: date
 *               intervalDays:
 *                 type: integer
 *                 default: 30
 *                 description: Days between installments
 *     responses:
 *       201:
 *         description: Fee installments created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized to create fee installments
 */
router.post('/installments',
  authenticateToken,
  roleAuth(['admin', 'system_admin', 'finance_staff']),
  [
    body('studentId').isUUID().withMessage('Valid student ID is required'),
    body('academicYear').notEmpty().withMessage('Academic year is required'),
    body('semester').isInt({ min: 1, max: 2 }).withMessage('Semester must be 1 or 2'),
    body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be positive'),
    body('numberOfInstallments').isInt({ min: 1, max: 12 }).withMessage('Number of installments must be between 1 and 12'),
    body('firstDueDate').isDate().withMessage('Valid first due date is required'),
    body('intervalDays').optional().isInt({ min: 1, max: 365 }).withMessage('Interval days must be between 1 and 365')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const {
        studentId,
        academicYear,
        semester,
        totalAmount,
        numberOfInstallments,
        firstDueDate,
        intervalDays = 30
      } = req.body;

      // Verify student exists
      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Check if installments already exist for this student/year/semester
      const existingInstallments = await FeeInstallment.count({
        where: {
          studentId,
          academicYear,
          semester
        }
      });

      if (existingInstallments > 0) {
        return res.status(400).json({
          message: 'Fee installments already exist for this student in the specified academic year and semester'
        });
      }

      // Calculate installment amount
      const installmentAmount = totalAmount / numberOfInstallments;

      // Create installments
      const installments = [];
      let currentDueDate = new Date(firstDueDate);

      for (let i = 1; i <= numberOfInstallments; i++) {
        const installment = await FeeInstallment.create({
          studentId,
          academicYear,
          semester,
          installmentNumber: i,
          totalInstallments: numberOfInstallments,
          amount: installmentAmount,
          dueDate: new Date(currentDueDate),
          createdBy: userId
        });

        installments.push(installment);

        // Add interval days for next installment
        currentDueDate.setDate(currentDueDate.getDate() + intervalDays);
      }

      // Create notification for student
      await Notification.create({
        recipientId: studentId,
        senderId: userId,
        title: 'Fee Installment Plan Created',
        message: `Your fee installment plan has been created for ${academicYear} Semester ${semester}. Total: $${totalAmount.toFixed(2)} in ${numberOfInstallments} installments.`,
        type: 'info',
        category: 'finance',
        isPopup: true,
        priority: 'medium',
        metadata: {
          academicYear,
          semester,
          totalAmount,
          numberOfInstallments
        }
      });

      logger.info(`${numberOfInstallments} fee installments created for student ${studentId} by user ${userId}`);

      res.status(201).json({
        message: 'Fee installments created successfully',
        installments: installments.map(i => ({
          id: i.id,
          installmentNumber: i.installmentNumber,
          amount: i.amount,
          dueDate: i.dueDate,
          status: i.status
        })),
        summary: {
          totalAmount,
          numberOfInstallments,
          installmentAmount,
          firstDueDate
        }
      });

    } catch (error) {
      logger.error('Error creating fee installments:', error);
      res.status(500).json({
        message: 'Error creating fee installments',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/finance/installments/{id}/pay:
 *   post:
 *     summary: Record payment for a fee installment (Finance/Admin only)
 *     tags: [Finance]
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
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, bank_transfer, mobile_money, card, cheque]
 *               transactionReference:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment recorded successfully
 *       400:
 *         description: Validation error or invalid payment amount
 *       403:
 *         description: Not authorized to record payments
 *       404:
 *         description: Installment not found
 */
router.post('/installments/:id/pay',
  authenticateToken,
  roleAuth(['admin', 'system_admin', 'finance_staff']),
  [
    param('id').isUUID(),
    body('amount').isFloat({ min: 0 }).withMessage('Payment amount must be positive'),
    body('paymentMethod').optional().isIn(['cash', 'bank_transfer', 'mobile_money', 'card', 'cheque']),
    body('transactionReference').optional().isString(),
    body('notes').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const userId = req.user.id;
      const {
        amount,
        paymentMethod,
        transactionReference,
        notes
      } = req.body;

      // Find installment
      const installment = await FeeInstallment.findByPk(id, {
        include: [{
          model: Student,
          as: 'student',
          attributes: ['matricule', 'firstName', 'lastName', 'email']
        }]
      });

      if (!installment) {
        return res.status(404).json({ message: 'Fee installment not found' });
      }

      // Calculate remaining amount
      const remainingAmount = installment.amount - installment.paidAmount;

      if (amount > remainingAmount) {
        return res.status(400).json({
          message: `Payment amount (${amount}) exceeds remaining amount (${remainingAmount})`
        });
      }

      // Update installment
      const newPaidAmount = installment.paidAmount + amount;
      const updateData = {
        paidAmount: newPaidAmount,
        updatedBy: userId
      };

      if (newPaidAmount >= installment.amount) {
        updateData.status = 'paid';
        updateData.paidDate = new Date();
      } else if (newPaidAmount > 0) {
        updateData.status = 'partial';
      }

      if (paymentMethod) updateData.paymentMethod = paymentMethod;
      if (transactionReference) updateData.transactionReference = transactionReference;
      if (notes) updateData.notes = notes;

      await installment.update(updateData);

      // Create notification for student
      await Notification.create({
        recipientId: installment.studentId,
        senderId: userId,
        title: 'Fee Payment Recorded',
        message: `A payment of $${amount.toFixed(2)} has been recorded for Installment ${installment.installmentNumber}/${installment.totalInstallments}. ${newPaidAmount >= installment.amount ? 'Installment fully paid!' : `Remaining: $${(installment.amount - newPaidAmount).toFixed(2)}`}`,
        type: newPaidAmount >= installment.amount ? 'success' : 'info',
        category: 'finance',
        isPopup: true,
        priority: 'medium',
        metadata: {
          installmentId: installment.id,
          installmentNumber: installment.installmentNumber,
          amountPaid: amount,
          totalPaid: newPaidAmount,
          remaining: installment.amount - newPaidAmount
        }
      });

      logger.info(`Payment of $${amount} recorded for installment ${id} by user ${userId}`);

      res.json({
        message: 'Payment recorded successfully',
        installment: {
          id: installment.id,
          installmentNumber: installment.installmentNumber,
          amount: installment.amount,
          paidAmount: installment.paidAmount,
          status: installment.status,
          paymentMethod: installment.paymentMethod,
          transactionReference: installment.transactionReference
        },
        payment: {
          amount,
          method: paymentMethod,
          reference: transactionReference
        }
      });

    } catch (error) {
      logger.error('Error recording payment:', error);
      res.status(500).json({
        message: 'Error recording payment',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/finance/installments/{id}:
 *   put:
 *     summary: Update fee installment (Finance/Admin only)
 *     tags: [Finance]
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
 *               amount:
 *                 type: number
 *                 format: float
 *               dueDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [pending, partial, paid, overdue, waived]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fee installment updated successfully
 *       403:
 *         description: Not authorized to update installment
 *       404:
 *         description: Installment not found
 */
router.put('/installments/:id',
  authenticateToken,
  roleAuth(['admin', 'system_admin', 'finance_staff']),
  [
    param('id').isUUID(),
    body('amount').optional().isFloat({ min: 0 }),
    body('dueDate').optional().isDate(),
    body('status').optional().isIn(['pending', 'partial', 'paid', 'overdue', 'waived']),
    body('notes').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Find installment
      const installment = await FeeInstallment.findByPk(id);
      if (!installment) {
        return res.status(404).json({ message: 'Fee installment not found' });
      }

      // Add updatedBy field
      updateData.updatedBy = userId;

      // Update installment
      await installment.update(updateData);

      logger.info(`Fee installment ${id} updated by user ${userId}`);

      res.json({
        message: 'Fee installment updated successfully',
        installment
      });

    } catch (error) {
      logger.error('Error updating fee installment:', error);
      res.status(500).json({
        message: 'Error updating fee installment',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/finance/student/{studentId}/summary:
 *   get:
 *     summary: Get fee payment summary for a student
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: academicYear
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fee payment summary
 *       403:
 *         description: Not authorized to view this student's fees
 *       404:
 *         description: Student not found
 */
router.get('/student/:studentId/summary',
  authenticateToken,
  [
    param('studentId').isUUID(),
    query('academicYear').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { studentId } = req.params;
      const { academicYear = new Date().getFullYear().toString() } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Check permissions
      if (userRole === 'student' && studentId !== userId) {
        return res.status(403).json({
          message: 'You can only view your own fee summary'
        });
      }

      // Verify student exists
      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Get all installments for the student
      const installments = await FeeInstallment.findAll({
        where: {
          studentId,
          academicYear
        },
        order: [['semester', 'ASC'], ['installmentNumber', 'ASC']]
      });

      // Calculate summary
      const summary = {
        student: {
          matricule: student.matricule,
          firstName: student.firstName,
          lastName: student.lastName
        },
        academicYear,
        totalInstallments: installments.length,
        totalAmount: installments.reduce((sum, inst) => sum + parseFloat(inst.amount), 0),
        totalPaid: installments.reduce((sum, inst) => sum + parseFloat(inst.paidAmount), 0),
        totalPending: 0,
        totalOverdue: 0,
        semesters: {}
      };

      // Group by semester
      installments.forEach(installment => {
        const semesterKey = `semester_${installment.semester}`;
        if (!summary.semesters[semesterKey]) {
          summary.semesters[semesterKey] = {
            semester: installment.semester,
            totalAmount: 0,
            totalPaid: 0,
            pendingCount: 0,
            overdueCount: 0,
            installments: []
          };
        }

        const semester = summary.semesters[semesterKey];
        semester.totalAmount += parseFloat(installment.amount);
        semester.totalPaid += parseFloat(installment.paidAmount);
        semester.installments.push({
          id: installment.id,
          number: installment.installmentNumber,
          amount: installment.amount,
          paidAmount: installment.paidAmount,
          dueDate: installment.dueDate,
          status: installment.status,
          paymentMethod: installment.paymentMethod
        });

        if (installment.status === 'pending' || installment.status === 'partial') {
          semester.pendingCount++;
          summary.totalPending += (parseFloat(installment.amount) - parseFloat(installment.paidAmount));
        }

        if (installment.status === 'overdue') {
          semester.overdueCount++;
          summary.totalOverdue += (parseFloat(installment.amount) - parseFloat(installment.paidAmount));
        }
      });

      // Check if student should be blocked due to unpaid fees
      const shouldBlockAccess = summary.totalOverdue > 0 || summary.totalPending > 100; // Block if overdue or pending > $100

      logger.info(`Fee summary retrieved for student ${studentId} by user ${userId}`);

      res.json({
        summary,
        accessControl: {
          shouldBlockAccess,
          reason: shouldBlockAccess ? 'Outstanding fees detected' : null
        }
      });

    } catch (error) {
      logger.error('Error fetching fee summary:', error);
      res.status(500).json({
        message: 'Error fetching fee summary',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @swagger
 * /api/finance/overdue-notifications:
 *   post:
 *     summary: Send overdue payment notifications (Finance/Admin only)
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
 *               academicYear:
 *                 type: string
 *               semester:
 *                 type: integer
 *                 enum: [1, 2]
 *               daysOverdue:
 *                 type: integer
 *                 default: 7
 *                 description: Send notifications for installments overdue by at least this many days
 *     responses:
 *       200:
 *         description: Overdue notifications sent successfully
 *       403:
 *         description: Not authorized to send notifications
 */
router.post('/overdue-notifications',
  authenticateToken,
  roleAuth(['admin', 'system_admin', 'finance_staff']),
  [
    body('academicYear').optional().isString(),
    body('semester').optional().isInt({ min: 1, max: 2 }),
    body('daysOverdue').optional().isInt({ min: 1, max: 365 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const {
        academicYear = new Date().getFullYear().toString(),
        semester,
        daysOverdue = 7
      } = req.body;

      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);

      // Build WHERE conditions
      const whereConditions = {
        academicYear,
        dueDate: { [Op.lt]: cutoffDate },
        status: { [Op.in]: ['pending', 'partial'] },
        paidAmount: { [Op.lt]: sequelize.col('amount') }
      };

      if (semester) whereConditions.semester = semester;

      // Get overdue installments
      const overdueInstallments = await FeeInstallment.findAll({
        where: whereConditions,
        include: [{
          model: Student,
          as: 'student',
          attributes: ['matricule', 'firstName', 'lastName', 'email']
        }]
      });

      // Group by student and send notifications
      const studentNotifications = {};
      overdueInstallments.forEach(installment => {
        const studentId = installment.studentId;
        if (!studentNotifications[studentId]) {
          studentNotifications[studentId] = {
            student: installment.student,
            installments: []
          };
        }
        studentNotifications[studentId].installments.push(installment);
      });

      // Send notifications
      const notificationsSent = [];
      for (const [studentId, data] of Object.entries(studentNotifications)) {
        const { student, installments } = data;
        const totalOverdue = installments.reduce((sum, inst) => sum + (parseFloat(inst.amount) - parseFloat(inst.paidAmount)), 0);

        await Notification.create({
          recipientId: studentId,
          senderId: userId,
          title: 'Overdue Fee Payment Notice',
          message: `You have ${installments.length} overdue fee installment(s) totaling $${totalOverdue.toFixed(2)}. Please make payment immediately to avoid access restrictions.`,
          type: 'warning',
          category: 'finance',
          isPopup: true,
          priority: 'urgent',
          metadata: {
            overdueCount: installments.length,
            totalOverdue,
            academicYear,
            semester
          }
        });

        notificationsSent.push({
          studentId,
          matricule: student.matricule,
          overdueCount: installments.length,
          totalOverdue
        });
      }

      logger.info(`${notificationsSent.length} overdue payment notifications sent by user ${userId}`);

      res.json({
        message: 'Overdue payment notifications sent successfully',
        sent: notificationsSent.length,
        notifications: notificationsSent,
        criteria: {
          academicYear,
          semester,
          daysOverdue
        }
      });

    } catch (error) {
      logger.error('Error sending overdue notifications:', error);
      res.status(500).json({
        message: 'Error sending overdue notifications',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;
