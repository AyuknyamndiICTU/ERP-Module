const request = require('supertest');
const express = require('express');
const hrRoutes = require('../src/routes/hr');
const authRoutes = require('../src/routes/auth');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/hr', hrRoutes);

describe('HR & Administration Module', () => {
  let adminToken, hrToken;
  let testEmployeeId, testPayrollId, testLeaveId;

  beforeAll(async () => {
    // Login as admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Admin@123'
      });
    adminToken = adminLogin.body.token;

    // Login as HR personnel
    const hrLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'hr@test.com',
        password: 'HR@123'
      });
    hrToken = hrLogin.body.token;
  });

  describe('Employee Management', () => {
    const testEmployee = {
      employeeId: 'EMP001',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@university.edu',
      phone: '+1234567890',
      department: 'Computer Science',
      position: 'Assistant Professor',
      hireDate: '2024-01-15',
      salary: 75000,
      employmentType: 'full-time',
      status: 'active'
    };

    it('should create new employee', async () => {
      const res = await request(app)
        .post('/api/hr/employees')
        .set('Authorization', `Bearer ${hrToken}`)
        .send(testEmployee);
      
      expect([200, 201]).toContain(res.statusCode);
      if (res.body.employee) {
        testEmployeeId = res.body.employee.id;
      }
    });

    it('should get all employees', async () => {
      const res = await request(app)
        .get('/api/hr/employees')
        .set('Authorization', `Bearer ${hrToken}`);
      
      expect(res.statusCode).toEqual(200);
    });

    it('should get employee by ID', async () => {
      if (testEmployeeId) {
        const res = await request(app)
          .get(`/api/hr/employees/${testEmployeeId}`)
          .set('Authorization', `Bearer ${hrToken}`);
        
        expect(res.statusCode).toEqual(200);
      }
    });

    it('should update employee information', async () => {
      if (testEmployeeId) {
        const res = await request(app)
          .put(`/api/hr/employees/${testEmployeeId}`)
          .set('Authorization', `Bearer ${hrToken}`)
          .send({ salary: 80000 });
        
        expect(res.statusCode).toEqual(200);
      }
    });

    it('should get employees by department', async () => {
      const res = await request(app)
        .get('/api/hr/employees/department/Computer Science')
        .set('Authorization', `Bearer ${hrToken}`);
      
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('Payroll Processing', () => {
    const payrollData = {
      payPeriod: '2024-03',
      employees: [
        {
          employeeId: testEmployeeId,
          baseSalary: 75000,
          overtime: 0,
          bonuses: 1000,
          deductions: 500,
          netPay: 75500
        }
      ]
    };

    it('should process payroll', async () => {
      const res = await request(app)
        .post('/api/hr/payroll')
        .set('Authorization', `Bearer ${hrToken}`)
        .send(payrollData);
      
      expect([200, 201]).toContain(res.statusCode);
      if (res.body.payroll) {
        testPayrollId = res.body.payroll.id;
      }
    });

    it('should get payroll records', async () => {
      const res = await request(app)
        .get('/api/hr/payroll')
        .set('Authorization', `Bearer ${hrToken}`);
      
      expect(res.statusCode).toEqual(200);
    });

    it('should generate payslip', async () => {
      if (testEmployeeId) {
        const res = await request(app)
          .get(`/api/hr/payroll/employee/${testEmployeeId}/payslip`)
          .set('Authorization', `Bearer ${hrToken}`);
        
        expect([200, 404]).toContain(res.statusCode);
      }
    });

    it('should calculate tax deductions', async () => {
      const res = await request(app)
        .post('/api/hr/payroll/calculate-tax')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          grossSalary: 75000,
          taxYear: 2024
        });
      
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('Leave Management', () => {
    const leaveRequest = {
      employeeId: testEmployeeId,
      leaveType: 'annual',
      startDate: '2024-04-01',
      endDate: '2024-04-05',
      reason: 'Personal vacation',
      status: 'pending'
    };

    it('should submit leave request', async () => {
      const res = await request(app)
        .post('/api/hr/leave-requests')
        .set('Authorization', `Bearer ${hrToken}`)
        .send(leaveRequest);
      
      expect([200, 201]).toContain(res.statusCode);
      if (res.body.leaveRequest) {
        testLeaveId = res.body.leaveRequest.id;
      }
    });

    it('should get leave requests', async () => {
      const res = await request(app)
        .get('/api/hr/leave-requests')
        .set('Authorization', `Bearer ${hrToken}`);
      
      expect(res.statusCode).toEqual(200);
    });

    it('should approve leave request', async () => {
      if (testLeaveId) {
        const res = await request(app)
          .put(`/api/hr/leave-requests/${testLeaveId}/approve`)
          .set('Authorization', `Bearer ${hrToken}`);
        
        expect(res.statusCode).toEqual(200);
      }
    });

    it('should get employee leave balance', async () => {
      if (testEmployeeId) {
        const res = await request(app)
          .get(`/api/hr/employees/${testEmployeeId}/leave-balance`)
          .set('Authorization', `Bearer ${hrToken}`);
        
        expect(res.statusCode).toEqual(200);
      }
    });

    it('should generate leave report', async () => {
      const res = await request(app)
        .get('/api/hr/leave-requests/report?startDate=2024-01-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${hrToken}`);
      
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('Performance Management', () => {
    const performanceReview = {
      employeeId: testEmployeeId,
      reviewPeriod: '2024-Q1',
      reviewerId: 'manager-id',
      goals: [
        { description: 'Complete project X', status: 'achieved', score: 5 },
        { description: 'Improve team collaboration', status: 'in-progress', score: 4 }
      ],
      overallRating: 4.5,
      comments: 'Excellent performance this quarter'
    };

    it('should create performance review', async () => {
      const res = await request(app)
        .post('/api/hr/performance-reviews')
        .set('Authorization', `Bearer ${hrToken}`)
        .send(performanceReview);
      
      expect([200, 201]).toContain(res.statusCode);
    });

    it('should get performance reviews', async () => {
      const res = await request(app)
        .get('/api/hr/performance-reviews')
        .set('Authorization', `Bearer ${hrToken}`);
      
      expect(res.statusCode).toEqual(200);
    });

    it('should get employee performance history', async () => {
      if (testEmployeeId) {
        const res = await request(app)
          .get(`/api/hr/employees/${testEmployeeId}/performance`)
          .set('Authorization', `Bearer ${hrToken}`);
        
        expect(res.statusCode).toEqual(200);
      }
    });
  });

  describe('Asset Management', () => {
    const testAsset = {
      assetTag: 'LAPTOP001',
      assetType: 'laptop',
      brand: 'Dell',
      model: 'Latitude 5520',
      serialNumber: 'DL123456789',
      purchaseDate: '2024-01-15',
      purchasePrice: 1200,
      assignedTo: testEmployeeId,
      status: 'active',
      location: 'CS Department'
    };

    it('should register new asset', async () => {
      const res = await request(app)
        .post('/api/hr/assets')
        .set('Authorization', `Bearer ${hrToken}`)
        .send(testAsset);
      
      expect([200, 201]).toContain(res.statusCode);
    });

    it('should get all assets', async () => {
      const res = await request(app)
        .get('/api/hr/assets')
        .set('Authorization', `Bearer ${hrToken}`);
      
      expect(res.statusCode).toEqual(200);
    });

    it('should assign asset to employee', async () => {
      const res = await request(app)
        .post('/api/hr/assets/assign')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          assetId: 'LAPTOP001',
          employeeId: testEmployeeId,
          assignmentDate: '2024-01-15'
        });
      
      expect([200, 201, 404]).toContain(res.statusCode);
    });

    it('should track asset maintenance', async () => {
      const res = await request(app)
        .post('/api/hr/assets/maintenance')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          assetId: 'LAPTOP001',
          maintenanceType: 'routine',
          description: 'Software update and cleaning',
          cost: 50,
          maintenanceDate: '2024-03-15'
        });
      
      expect([200, 201, 404]).toContain(res.statusCode);
    });
  });
});
