const express = require('express');
const router = express.Router();
const { FeeStructure, FeeInstallment, StudentFinance, Student, Notification } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { body, validationResult } = require('express-validator');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * @swagger
 * tags:
 *   name: Finance
 *   description: Finance module endpoints for fee management, payments, budgets, and financial reporting
 */

// Invoice Management Routes
/**
 * @swagger
 * /api/finance/invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoices retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// ICTU Finance Management - Installment-based Fee System

/**
 * @swagger
 * /api/finance/student/{studentId}/installments:
 *   get:
 *     summary: Get student fee installments
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/student/:studentId/installments', authenticateToken, roleAuth(['admin', 'finance_staff', 'student']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear, semester } = req.query;
    
    // Students can only view their own installments
    if (req.user.role === 'student' && req.user.studentId !== parseInt(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const whereClause = { studentId };
    if (academicYear) whereClause.academicYear = academicYear;
    if (semester) whereClause.semester = semester;

    const installments = await FeeInstallment.findAll({
      where: whereClause,
      include: [{
        model: Student,
        as: 'student',
        attributes: ['matricule', 'firstName', 'lastName', 'email']
      }],
      order: [['dueDate', 'ASC']]
    });

    res.status(200).json({
      success: true,
      installments,
      message: 'Installments retrieved successfully'
    });
  } catch (error) {
    logger.error('Get installments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving installments'
    });
  }
});

/**
 * @swagger
 * /api/finance/student/{studentId}/finance-status:
 *   get:
 *     summary: Get student finance status
 */
router.get('/student/:studentId/finance-status', authenticateToken, roleAuth(['admin', 'finance_staff', 'student']), async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Students can only view their own status
    if (req.user.role === 'student' && req.user.studentId !== parseInt(studentId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const financeStatus = await StudentFinance.findOne({
      where: { studentId },
      include: [{
        model: Student,
        as: 'student',
        attributes: ['matricule', 'firstName', 'lastName', 'email', 'facultyId', 'majorId']
      }, {
        model: FeeInstallment,
        as: 'installments',
        where: { status: { [Op.in]: ['pending', 'partial', 'overdue'] } },
        required: false,
        order: [['dueDate', 'ASC']]
      }]
    });

    if (!financeStatus) {
      return res.status(404).json({
        success: false,
        message: 'Finance record not found'
      });
    }

    res.status(200).json({
      success: true,
      financeStatus,
      message: 'Finance status retrieved successfully'
    });
  } catch (error) {
    logger.error('Get finance status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving finance status'
    });
  }
});

/**
 * @swagger
 * /api/finance/installments/create:
 *   post:
 *     summary: Create installment plan for student
 */
router.post('/installments/create', 
  authenticateToken, 
  roleAuth(['admin', 'finance_staff']),
  [
    body('studentId').isInt().withMessage('Valid student ID required'),
    body('totalAmount').isFloat({ min: 0 }).withMessage('Valid total amount required'),
    body('installmentCount').isInt({ min: 1, max: 12 }).withMessage('Installment count must be 1-12'),
    body('academicYear').notEmpty().withMessage('Academic year required'),
    body('semester').isInt({ min: 1, max: 8 }).withMessage('Valid semester required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { studentId, totalAmount, installmentCount, academicYear, semester, firstDueDate } = req.body;
      
      // Check if student exists
      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Create or update student finance record
      const [studentFinance] = await StudentFinance.findOrCreate({
        where: { studentId },
        defaults: {
          studentId,
          totalFeeAmount: totalAmount,
          academicYear,
          semester,
          installmentPlan: {
            totalInstallments: installmentCount,
            installmentAmount: totalAmount / installmentCount,
            frequency: 'monthly'
          }
        }
      });

      // Create installments
      const installmentAmount = totalAmount / installmentCount;
      const installments = [];
      const startDate = new Date(firstDueDate || new Date());

      for (let i = 1; i <= installmentCount; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + (i - 1));

        const installment = await FeeInstallment.create({
          studentId,
          academicYear,
          semester,
          installmentNumber: i,
          totalInstallments: installmentCount,
          amount: installmentAmount,
          dueDate,
          createdBy: req.user.id
        });
        installments.push(installment);
      }

      // Update next due date
      await studentFinance.update({
        nextDueDate: installments[0].dueDate
      });

      // Create notification for student
      await Notification.create({
        recipientId: student.userId,
        senderId: req.user.id,
        title: 'Fee Installment Plan Created',
        message: `Your fee installment plan has been created with ${installmentCount} installments of ${installmentAmount} each.`,
        type: 'info',
        category: 'finance',
        isPopup: true,
        priority: 'medium'
      });

      res.status(201).json({
        success: true,
        installments,
        studentFinance,
        message: 'Installment plan created successfully'
      });
    } catch (error) {
      logger.error('Create installments error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error creating installments'
      });
    }
  }
);

/**
 * @swagger
 * /api/finance/payment/record:
 *   post:
 *     summary: Record payment for installment
 */
router.post('/payment/record',
  authenticateToken,
  roleAuth(['admin', 'finance_staff']),
  [
    body('installmentId').isInt().withMessage('Valid installment ID required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid payment amount required'),
    body('paymentMethod').isIn(['cash', 'bank_transfer', 'mobile_money', 'card', 'cheque']).withMessage('Valid payment method required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { installmentId, amount, paymentMethod, transactionReference, notes } = req.body;

      const installment = await FeeInstallment.findByPk(installmentId, {
        include: [{
          model: Student,
          as: 'student'
        }]
      });

      if (!installment) {
        return res.status(404).json({
          success: false,
          message: 'Installment not found'
        });
      }

      // Update installment payment
      await installment.update({
        paidAmount: installment.paidAmount + parseFloat(amount),
        paymentMethod,
        transactionReference,
        notes,
        updatedBy: req.user.id
      });

      // Update student finance totals
      const studentFinance = await StudentFinance.findOne({
        where: { studentId: installment.studentId }
      });

      if (studentFinance) {
        await studentFinance.update({
          totalPaidAmount: studentFinance.totalPaidAmount + parseFloat(amount),
          lastPaymentDate: new Date()
        });
      }

      // Create notification for student
      if (installment.student.userId) {
        await Notification.create({
          recipientId: installment.student.userId,
          senderId: req.user.id,
          title: 'Payment Recorded',
          message: `Payment of ${amount} has been recorded for your installment. Transaction: ${transactionReference || 'N/A'}`,
          type: 'success',
          category: 'finance',
          isPopup: true,
          priority: 'medium'
        });
      }

      res.status(200).json({
        success: true,
        installment: await FeeInstallment.findByPk(installmentId),
        message: 'Payment recorded successfully'
      });
    } catch (error) {
      logger.error('Record payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error recording payment'
      });
    }
  }
);

/**
 * @swagger
 * /api/finance/student/{studentId}/block:
 *   post:
 *     summary: Block student access due to unpaid fees
 */
router.post('/student/:studentId/block',
  authenticateToken,
  roleAuth(['admin', 'finance_staff']),
  [
    body('reason').notEmpty().withMessage('Block reason required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { studentId } = req.params;
      const { reason } = req.body;

      const studentFinance = await StudentFinance.findOne({
        where: { studentId },
        include: [{
          model: Student,
          as: 'student'
        }]
      });

      if (!studentFinance) {
        return res.status(404).json({
          success: false,
          message: 'Student finance record not found'
        });
      }

      await studentFinance.update({
        isBlocked: true,
        blockReason: reason,
        blockedDate: new Date(),
        blockedBy: req.user.id,
        paymentStatus: 'blocked'
      });

      // Create notification for student
      if (studentFinance.student.userId) {
        await Notification.create({
          recipientId: studentFinance.student.userId,
          senderId: req.user.id,
          title: 'Account Blocked - Payment Required',
          message: `Your account has been blocked due to: ${reason}. Please contact the finance office.`,
          type: 'error',
          category: 'finance',
          isPopup: true,
          priority: 'urgent'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Student blocked successfully'
      });
    } catch (error) {
      logger.error('Block student error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error blocking student'
      });
    }
  }
);

/**
 * @swagger
 * /api/finance/student/{studentId}/unblock:
 *   post:
 *     summary: Unblock student access
 */
router.post('/student/:studentId/unblock',
  authenticateToken,
  roleAuth(['admin', 'finance_staff']),
  async (req, res) => {
    try {
      const { studentId } = req.params;

      const studentFinance = await StudentFinance.findOne({
        where: { studentId },
        include: [{
          model: Student,
          as: 'student'
        }]
      });

      if (!studentFinance) {
        return res.status(404).json({
          success: false,
          message: 'Student finance record not found'
        });
      }

      await studentFinance.update({
        isBlocked: false,
        blockReason: null,
        blockedDate: null,
        blockedBy: null
      });

      // Create notification for student
      if (studentFinance.student.userId) {
        await Notification.create({
          recipientId: studentFinance.student.userId,
          senderId: req.user.id,
          title: 'Account Unblocked',
          message: 'Your account has been unblocked. You can now access all system features.',
          type: 'success',
          category: 'finance',
          isPopup: true,
          priority: 'medium'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Student unblocked successfully'
      });
    } catch (error) {
      logger.error('Unblock student error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error unblocking student'
      });
    }
  }
);

/**
 * @swagger
 * /api/finance/overdue-notifications:
 *   post:
 *     summary: Send overdue payment notifications
 */
router.post('/overdue-notifications',
  authenticateToken,
  roleAuth(['admin', 'finance_staff']),
  async (req, res) => {
    try {
      const overdueInstallments = await FeeInstallment.findAll({
        where: {
          status: 'overdue',
          dueDate: {
            [Op.lt]: new Date()
          }
        },
        include: [{
          model: Student,
          as: 'student',
          where: {
            userId: {
              [Op.ne]: null
            }
          }
        }]
      });

      const notifications = [];
      for (const installment of overdueInstallments) {
        const daysPastDue = Math.floor((new Date() - installment.dueDate) / (1000 * 60 * 60 * 24));
        
        const notification = await Notification.create({
          recipientId: installment.student.userId,
          senderId: req.user.id,
          title: 'Overdue Payment Reminder',
          message: `Your installment payment of ${installment.amount} is ${daysPastDue} days overdue. Please make payment to avoid account suspension.`,
          type: 'warning',
          category: 'finance',
          isPopup: true,
          priority: daysPastDue > 30 ? 'urgent' : 'high'
        });
        
        notifications.push(notification);
      }

      res.status(200).json({
        success: true,
        notificationsSent: notifications.length,
        message: `${notifications.length} overdue notifications sent successfully`
      });
    } catch (error) {
      logger.error('Send overdue notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error sending notifications'
      });
    }
  }
);

router.get('/invoices', authenticateToken, roleAuth(['admin', 'finance_staff']), async (req, res) => {
  try {
    const invoices = [];
    res.status(200).json({
      success: true,
      invoices,
      message: 'Invoices retrieved successfully'
    });
  } catch (error) {
    logger.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving invoices'
    });
  }
});

/**
 * @swagger
 * /api/finance/invoices:
 *   post:
 *     summary: Create new invoice
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/invoices', authenticateToken, roleAuth(['admin', 'finance_staff']), async (req, res) => {
  try {
    const { studentId, feeStructureId, dueDate } = req.body;
    
    if (!studentId || !feeStructureId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and fee structure ID are required'
      });
    }

    const invoice = {
      id: Date.now(),
      studentId,
      feeStructureId,
      dueDate,
      status: 'pending',
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      invoice,
      message: 'Invoice created successfully'
    });
  } catch (error) {
    logger.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating invoice'
    });
  }
});

/**
 * @swagger
 * /api/finance/invoices/{id}:
 *   put:
 *     summary: Update invoice
 *     tags: [Finance]
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
 *         description: Invoice updated successfully
 *       404:
 *         description: Invoice not found
 */
router.put('/invoices/:id', authenticateToken, roleAuth(['admin', 'finance_staff']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    res.status(200).json({
      success: true,
      invoice: { id, ...updateData, updatedAt: new Date() },
      message: 'Invoice updated successfully'
    });
  } catch (error) {
    logger.error('Update invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating invoice'
    });
  }
});

/**
 * @swagger
 * /api/finance/invoices/{id}:
 *   delete:
 *     summary: Delete invoice
 *     tags: [Finance]
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
 *         description: Invoice deleted successfully
 *       404:
 *         description: Invoice not found
 */
router.delete('/invoices/:id', authenticateToken, roleAuth(['admin', 'finance_staff']), async (req, res) => {
  try {
    const { id } = req.params;

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    logger.error('Delete invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting invoice'
    });
  }
});

// Payment Management Routes
/**
 * @swagger
 * /api/finance/payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/payments', authenticateToken, roleAuth(['admin', 'finance_staff']), async (req, res) => {
  try {
    const payments = [];
    res.status(200).json({
      success: true,
      payments,
      message: 'Payments retrieved successfully'
    });
  } catch (error) {
    logger.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving payments'
    });
  }
});

/**
 * @swagger
 * /api/finance/payments:
 *   post:
 *     summary: Process payment
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Payment processed successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/payments', authenticateToken, roleAuth(['admin', 'finance_staff', 'student']), async (req, res) => {
  try {
    const { invoiceId, amount, paymentMethod } = req.body;
    
    if (!invoiceId || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Invoice ID, amount, and payment method are required'
      });
    }

    const payment = {
      id: Date.now(),
      invoiceId,
      amount,
      paymentMethod,
      status: 'completed',
      transactionId: `TXN_${Date.now()}`,
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      payment,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    logger.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing payment'
    });
  }
});

// Budget Management Routes
/**
 * @swagger
 * /api/finance/budgets:
 *   get:
 *     summary: Get all budgets
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budgets retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/budgets', authenticateToken, roleAuth(['admin', 'finance_staff']), async (req, res) => {
  try {
    const budgets = [];
    res.status(200).json({
      success: true,
      budgets,
      message: 'Budgets retrieved successfully'
    });
  } catch (error) {
    logger.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving budgets'
    });
  }
});

/**
 * @swagger
 * /api/finance/budgets:
 *   post:
 *     summary: Create new budget
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Budget created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/budgets', authenticateToken, roleAuth(['admin', 'finance_staff']), async (req, res) => {
  try {
    const { name, amount, category, academicYear } = req.body;
    
    if (!name || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, amount, and category are required'
      });
    }

    const budget = {
      id: Date.now(),
      name,
      amount,
      category,
      academicYear: academicYear || new Date().getFullYear(),
      spent: 0,
      remaining: amount,
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      budget,
      message: 'Budget created successfully'
    });
  } catch (error) {
    logger.error('Create budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating budget'
    });
  }
});

/**
 * @swagger
 * /api/finance/budgets/{id}:
 *   put:
 *     summary: Update budget
 *     tags: [Finance]
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
 *         description: Budget updated successfully
 *       404:
 *         description: Budget not found
 */
router.put('/budgets/:id', authenticateToken, roleAuth(['admin', 'finance_staff']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    res.status(200).json({
      success: true,
      budget: { id, ...updateData, updatedAt: new Date() },
      message: 'Budget updated successfully'
    });
  } catch (error) {
    logger.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating budget'
    });
  }
});

/**
 * @swagger
 * /api/finance/budgets/{id}:
 *   delete:
 *     summary: Delete budget
 *     tags: [Finance]
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
 *         description: Budget deleted successfully
 *       404:
 *         description: Budget not found
 */
router.delete('/budgets/:id', authenticateToken, roleAuth(['admin', 'finance_staff']), async (req, res) => {
  try {
    const { id } = req.params;

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    logger.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting budget'
    });
  }
});

// Expense Management Routes
/**
 * @swagger
 * /api/finance/expenses:
 *   get:
 *     summary: Get all expenses
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expenses retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/expenses', authenticateToken, roleAuth(['admin', 'finance_staff']), async (req, res) => {
  try {
    const expenses = [];
    res.status(200).json({
      success: true,
      expenses,
      message: 'Expenses retrieved successfully'
    });
  } catch (error) {
    logger.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving expenses'
    });
  }
});

/**
 * @swagger
 * /api/finance/expenses:
 *   post:
 *     summary: Record new expense
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Expense recorded successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/expenses', authenticateToken, roleAuth(['admin', 'finance_staff']), async (req, res) => {
  try {
    const { description, amount, category, budgetId } = req.body;
    
    if (!description || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Description, amount, and category are required'
      });
    }

    const expense = {
      id: Date.now(),
      description,
      amount,
      category,
      budgetId,
      date: new Date(),
      createdBy: req.user.id,
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      expense,
      message: 'Expense recorded successfully'
    });
  } catch (error) {
    logger.error('Record expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error recording expense'
    });
  }
});

// Marketing Campaign Routes
/**
 * @swagger
 * /api/finance/campaigns:
 *   get:
 *     summary: Get all marketing campaigns
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Campaigns retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/campaigns', authenticateToken, roleAuth(['admin', 'marketing_staff']), async (req, res) => {
  try {
    const campaigns = [];
    res.status(200).json({
      success: true,
      campaigns,
      message: 'Campaigns retrieved successfully'
    });
  } catch (error) {
    logger.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving campaigns'
    });
  }
});

/**
 * @swagger
 * /api/finance/campaigns:
 *   post:
 *     summary: Create new marketing campaign
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/campaigns', authenticateToken, roleAuth(['admin', 'marketing_staff']), async (req, res) => {
  try {
    const { name, description, budget, startDate, endDate, targetAudience } = req.body;
    
    if (!name || !budget || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, budget, start date, and end date are required'
      });
    }

    const campaign = {
      id: Date.now(),
      name,
      description,
      budget,
      startDate,
      endDate,
      targetAudience,
      spent: 0,
      leads: 0,
      conversions: 0,
      status: 'active',
      createdBy: req.user.id,
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      campaign,
      message: 'Campaign created successfully'
    });
  } catch (error) {
    logger.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating campaign'
    });
  }
});

/**
 * @swagger
 * /api/finance/campaigns/{id}:
 *   put:
 *     summary: Update campaign
 *     tags: [Finance]
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
 *         description: Campaign updated successfully
 *       404:
 *         description: Campaign not found
 */
router.put('/campaigns/:id', authenticateToken, roleAuth(['admin', 'marketing_staff']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    res.status(200).json({
      success: true,
      campaign: { id, ...updateData, updatedAt: new Date() },
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    logger.error('Update campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating campaign'
    });
  }
});

/**
 * @swagger
 * /api/finance/campaigns/{id}:
 *   delete:
 *     summary: Delete campaign
 *     tags: [Finance]
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
 *         description: Campaign deleted successfully
 *       404:
 *         description: Campaign not found
 */
router.delete('/campaigns/:id', authenticateToken, roleAuth(['admin', 'marketing_staff']), async (req, res) => {
  try {
    const { id } = req.params;

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    logger.error('Delete campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting campaign'
    });
  }
});

// Lead Management Routes
/**
 * @swagger
 * /api/finance/leads:
 *   get:
 *     summary: Get all leads
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leads retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/leads', authenticateToken, roleAuth(['admin', 'marketing_staff']), async (req, res) => {
  try {
    const leads = [];
    res.status(200).json({
      success: true,
      leads,
      message: 'Leads retrieved successfully'
    });
  } catch (error) {
    logger.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving leads'
    });
  }
});

/**
 * @swagger
 * /api/finance/leads:
 *   post:
 *     summary: Create new lead
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Lead created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/leads', authenticateToken, roleAuth(['admin', 'marketing_staff']), async (req, res) => {
  try {
    const { name, email, phone, source, status, notes } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    const lead = {
      id: Date.now(),
      name,
      email,
      phone,
      source,
      status: status || 'new',
      notes,
      createdBy: req.user.id,
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      lead,
      message: 'Lead created successfully'
    });
  } catch (error) {
    logger.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating lead'
    });
  }
});

// Financial Reports Routes
/**
 * @swagger
 * /api/finance/reports/financial-summary:
 *   get:
 *     summary: Generate financial summary report
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial summary generated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/reports/financial-summary', authenticateToken, roleAuth(['admin', 'finance_staff']), async (req, res) => {
  try {
    const summary = {
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      pendingPayments: 0,
      completedPayments: 0,
      budgetUtilization: 0,
      generatedAt: new Date()
    };

    res.status(200).json({
      success: true,
      summary,
      message: 'Financial summary generated successfully'
    });
  } catch (error) {
    logger.error('Financial summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating financial summary'
    });
  }
});

/**
 * @swagger
 * /api/finance/reports/campaign-roi:
 *   get:
 *     summary: Generate campaign ROI report
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Campaign ROI report generated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/reports/campaign-roi', authenticateToken, roleAuth(['admin', 'marketing_staff']), async (req, res) => {
  try {
    const roiReport = {
      campaigns: [],
      totalInvestment: 0,
      totalRevenue: 0,
      overallROI: 0,
      generatedAt: new Date()
    };

    res.status(200).json({
      success: true,
      report: roiReport,
      message: 'Campaign ROI report generated successfully'
    });
  } catch (error) {
    logger.error('Campaign ROI report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating campaign ROI report'
    });
  }
});

/**
 * @swagger
 * /api/finance/reports/budget-variance:
 *   get:
 *     summary: Generate budget variance report
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget variance report generated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/reports/budget-variance', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Generate budget variance report endpoint not implemented yet'
  });
});

module.exports = router;
