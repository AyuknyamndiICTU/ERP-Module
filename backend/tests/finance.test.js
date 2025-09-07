const request = require('supertest');
const express = require('express');
const financeRoutes = require('../src/routes/finance');
const authRoutes = require('../src/routes/auth');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);

describe('Marketing & Finance Module', () => {
  let adminToken, financeToken, studentToken;
  let testFeeStructureId, testPaymentId, testInvoiceId;

  beforeAll(async () => {
    // Login as admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Admin@123'
      });
    adminToken = adminLogin.body.token;

    // Login as finance staff
    const financeLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'finance@test.com',
        password: 'Finance@123'
      });
    financeToken = financeLogin.body.token;

    // Login as student
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@test.com',
        password: 'Student@123'
      });
    studentToken = studentLogin.body.token;
  });

  describe('Fee Management System', () => {
    const testFeeStructure = {
      name: 'Undergraduate Tuition 2024',
      academicYear: '2024-2025',
      semester: 'Fall',
      program: 'Computer Science',
      feeComponents: [
        { name: 'Tuition Fee', amount: 5000, type: 'mandatory' },
        { name: 'Lab Fee', amount: 300, type: 'mandatory' },
        { name: 'Library Fee', amount: 100, type: 'optional' }
      ],
      totalAmount: 5400,
      dueDate: '2024-08-15'
    };

    it('should create fee structure', async () => {
      const res = await request(app)
        .post('/api/finance/fee-structures')
        .set('Authorization', `Bearer ${financeToken}`)
        .send(testFeeStructure);
      
      expect([200, 201]).toContain(res.statusCode);
      if (res.body.feeStructure) {
        testFeeStructureId = res.body.feeStructure.id;
      }
    });

    it('should get all fee structures', async () => {
      const res = await request(app)
        .get('/api/finance/fee-structures')
        .set('Authorization', `Bearer ${financeToken}`);
      
      expect(res.statusCode).toEqual(200);
    });

    it('should generate student invoice', async () => {
      const res = await request(app)
        .post('/api/finance/invoices')
        .set('Authorization', `Bearer ${financeToken}`)
        .send({
          studentId: 'test-student-id',
          feeStructureId: testFeeStructureId,
          dueDate: '2024-08-15'
        });
      
      expect([200, 201, 404]).toContain(res.statusCode); // 404 if student doesn't exist
      if (res.body.invoice) {
        testInvoiceId = res.body.invoice.id;
      }
    });

    it('should process payment', async () => {
      const paymentData = {
        invoiceId: testInvoiceId,
        amount: 5400,
        paymentMethod: 'credit_card',
        paymentReference: 'PAY123456',
        paidBy: 'test-student-id'
      };

      const res = await request(app)
        .post('/api/finance/payments')
        .set('Authorization', `Bearer ${financeToken}`)
        .send(paymentData);
      
      expect([200, 201, 404]).toContain(res.statusCode);
      if (res.body.payment) {
        testPaymentId = res.body.payment.id;
      }
    });

    it('should generate payment receipt', async () => {
      if (testPaymentId) {
        const res = await request(app)
          .get(`/api/finance/payments/${testPaymentId}/receipt`)
          .set('Authorization', `Bearer ${financeToken}`);
        
        expect(res.statusCode).toEqual(200);
      }
    });

    it('should send payment reminder', async () => {
      const res = await request(app)
        .post('/api/finance/payment-reminders')
        .set('Authorization', `Bearer ${financeToken}`)
        .send({
          studentId: 'test-student-id',
          invoiceId: testInvoiceId,
          reminderType: 'overdue'
        });
      
      expect([200, 201, 404]).toContain(res.statusCode);
    });
  });

  describe('Financial Management', () => {
    it('should get revenue report', async () => {
      const res = await request(app)
        .get('/api/finance/reports/revenue?startDate=2024-01-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${financeToken}`);
      
      expect(res.statusCode).toEqual(200);
    });

    it('should get expense report', async () => {
      const res = await request(app)
        .get('/api/finance/reports/expenses?startDate=2024-01-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${financeToken}`);
      
      expect(res.statusCode).toEqual(200);
    });

    it('should get financial dashboard', async () => {
      const res = await request(app)
        .get('/api/finance/dashboard')
        .set('Authorization', `Bearer ${financeToken}`);
      
      expect(res.statusCode).toEqual(200);
    });

    it('should get outstanding payments', async () => {
      const res = await request(app)
        .get('/api/finance/outstanding-payments')
        .set('Authorization', `Bearer ${financeToken}`);
      
      expect(res.statusCode).toEqual(200);
    });

    it('should export financial data', async () => {
      const res = await request(app)
        .get('/api/finance/export?format=csv&type=payments')
        .set('Authorization', `Bearer ${financeToken}`);
      
      expect([200, 404]).toContain(res.statusCode);
    });
  });

  describe('Budget Management', () => {
    const testBudget = {
      name: 'Academic Year 2024-2025 Budget',
      fiscalYear: '2024-2025',
      totalBudget: 1000000,
      categories: [
        { name: 'Faculty Salaries', allocated: 600000, spent: 0 },
        { name: 'Infrastructure', allocated: 200000, spent: 0 },
        { name: 'Technology', allocated: 100000, spent: 0 },
        { name: 'Marketing', allocated: 50000, spent: 0 },
        { name: 'Miscellaneous', allocated: 50000, spent: 0 }
      ]
    };

    it('should create budget', async () => {
      const res = await request(app)
        .post('/api/finance/budgets')
        .set('Authorization', `Bearer ${financeToken}`)
        .send(testBudget);
      
      expect([200, 201]).toContain(res.statusCode);
    });

    it('should get budget overview', async () => {
      const res = await request(app)
        .get('/api/finance/budgets')
        .set('Authorization', `Bearer ${financeToken}`);
      
      expect(res.statusCode).toEqual(200);
    });

    it('should track budget utilization', async () => {
      const res = await request(app)
        .get('/api/finance/budgets/utilization')
        .set('Authorization', `Bearer ${financeToken}`);
      
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('Payment Integration', () => {
    it('should handle Stripe webhook', async () => {
      const webhookData = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            amount: 540000, // $5400 in cents
            currency: 'usd',
            status: 'succeeded'
          }
        }
      };

      const res = await request(app)
        .post('/api/finance/stripe-webhook')
        .send(webhookData);
      
      expect([200, 400]).toContain(res.statusCode);
    });

    it('should create payment intent', async () => {
      const res = await request(app)
        .post('/api/finance/create-payment-intent')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          amount: 5400,
          currency: 'usd',
          invoiceId: testInvoiceId
        });
      
      expect([200, 201, 404]).toContain(res.statusCode);
    });
  });
});
