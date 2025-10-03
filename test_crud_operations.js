#!/usr/bin/env node

/**
 * Comprehensive CRUD Operations Test Script
 * Educational ERP System - Full Stack Testing
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'http://localhost:3001/api';
const TEST_RESULTS_FILE = 'crud_test_results.json';

// Test credentials for different roles
const TEST_USERS = {
  admin: { email: 'admin@ictu.edu.cm', password: 'password123' },
  faculty_coordinator: { email: 'ict.coordinator@ictu.edu.cm', password: 'password123' },
  lecturer: { email: 'lecturer1@ictu.edu.cm', password: 'password123' },
  hr_staff: { email: 'hr@ictu.edu.cm', password: 'password123' },
  finance_staff: { email: 'finance@ictu.edu.cm', password: 'password123' },
  student: { email: 'student1@ictu.edu.cm', password: 'password123' }
};

// Global variables
let authTokens = {};
let testResults = {
  timestamp: new Date().toISOString(),
  summary: { total: 0, passed: 0, failed: 0 },
  modules: {}
};

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'     // Reset
  };
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication functions
async function authenticateUser(role) {
  try {
    const user = TEST_USERS[role];
    if (!user) throw new Error(`Invalid role: ${role}`);

    log(`Authenticating ${role}...`);
    const response = await axios.post(`${API_BASE_URL}/auth/login`, user);
    
    if (response.data.token) {
      authTokens[role] = response.data.token;
      log(`✅ ${role} authenticated successfully`, 'success');
      return response.data.token;
    }
    throw new Error('No token received');
  } catch (error) {
    log(`❌ Authentication failed for ${role}: ${error.message}`, 'error');
    throw error;
  }
}

// Test result tracking
function recordTest(module, operation, method, endpoint, success, error = null, data = null) {
  if (!testResults.modules[module]) {
    testResults.modules[module] = { total: 0, passed: 0, failed: 0, tests: [] };
  }
  
  const test = {
    operation,
    method,
    endpoint,
    success,
    timestamp: new Date().toISOString(),
    error: error?.message || null,
    responseData: success ? data : null
  };
  
  testResults.modules[module].tests.push(test);
  testResults.modules[module].total++;
  testResults.summary.total++;
  
  if (success) {
    testResults.modules[module].passed++;
    testResults.summary.passed++;
    log(`✅ ${module} - ${operation} (${method} ${endpoint})`, 'success');
  } else {
    testResults.modules[module].failed++;
    testResults.summary.failed++;
    log(`❌ ${module} - ${operation} (${method} ${endpoint}): ${error?.message}`, 'error');
  }
}

// Generic API test function
async function testAPI(module, operation, method, endpoint, token, data = null, expectedStatus = 200) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: { Authorization: `Bearer ${token}` }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }
    
    const response = await axios(config);
    const success = response.status === expectedStatus;
    recordTest(module, operation, method, endpoint, success, null, response.data);
    return response.data;
  } catch (error) {
    recordTest(module, operation, method, endpoint, false, error);
    throw error;
  }
}

// Academic Module Tests
async function testAcademicModule() {
  log('🎓 Testing Academic Module...', 'info');
  const token = authTokens.admin;
  
  try {
    // Test Students CRUD
    await testAPI('Academic', 'Get Students', 'GET', '/students', token);
    await testAPI('Academic', 'Get Student by ID', 'GET', '/students/1', token);
    
    // Test Courses CRUD
    await testAPI('Academic', 'Get Courses', 'GET', '/academic/courses', token);
    await testAPI('Academic', 'Get Course by ID', 'GET', '/academic/courses/1', token);
    
    const newCourse = {
      code: 'TEST101',
      courseName: 'Test Course',
      description: 'A test course for CRUD operations',
      credits: 3,
      semester: 1,
      academicYear: '2024/2025',
      departmentId: 1,
      difficulty: 'Undergraduate'
    };
    const createdCourse = await testAPI('Academic', 'Create Course', 'POST', '/academic/courses', token, newCourse, 201);
    
    if (createdCourse?.course?.id) {
      const updateData = { description: 'Updated test course description' };
      await testAPI('Academic', 'Update Course', 'PUT', `/academic/courses/${createdCourse.course.id}`, token, updateData);
      await testAPI('Academic', 'Delete Course', 'DELETE', `/academic/courses/${createdCourse.course.id}`, token);
    }
    
    // Test Grades
    await testAPI('Academic', 'Get Grades', 'GET', '/academic/grades', token);
    
    // Test Attendance
    await testAPI('Academic', 'Get Attendance', 'GET', '/academic/attendance', token);
    
  } catch (error) {
    log(`Academic module test error: ${error.message}`, 'error');
  }
}

// HR Module Tests
async function testHRModule() {
  log('👥 Testing HR Module...', 'info');
  const token = authTokens.hr_staff;
  
  try {
    // Test Employees CRUD
    await testAPI('HR', 'Get Employees', 'GET', '/hr/employees', token);
    await testAPI('HR', 'Get Employee by ID', 'GET', '/hr/employees/1', token);
    
    const newEmployee = {
      employeeId: 'TEST001',
      userId: 1,
      departmentId: 1,
      position: 'Test Position',
      salary: 1000000,
      hireDate: '2024-01-01',
      employmentType: 'full_time',
      phone: '+237600000000',
      address: 'Test Address'
    };
    const createdEmployee = await testAPI('HR', 'Create Employee', 'POST', '/hr/employees', token, newEmployee, 201);
    
    if (createdEmployee?.employee?.id) {
      const updateData = { position: 'Updated Test Position' };
      await testAPI('HR', 'Update Employee', 'PUT', `/hr/employees/${createdEmployee.employee.id}`, token, updateData);
      await testAPI('HR', 'Delete Employee', 'DELETE', `/hr/employees/${createdEmployee.employee.id}`, token);
    }
    
    // Test Departments
    await testAPI('HR', 'Get Departments', 'GET', '/hr/departments', token);
    
  } catch (error) {
    log(`HR module test error: ${error.message}`, 'error');
  }
}

// Finance Module Tests
async function testFinanceModule() {
  log('💰 Testing Finance Module...', 'info');
  const token = authTokens.finance_staff;
  
  try {
    // Test Invoices CRUD
    await testAPI('Finance', 'Get Invoices', 'GET', '/finance/invoices', token);
    await testAPI('Finance', 'Get Invoice by ID', 'GET', '/finance/invoices/1', token);
    
    const newInvoice = {
      studentId: 1,
      amount: 100000,
      description: 'Test Invoice',
      dueDate: '2024-12-31',
      academicYear: '2024/2025',
      semester: 1
    };
    const createdInvoice = await testAPI('Finance', 'Create Invoice', 'POST', '/finance/invoices', token, newInvoice, 201);
    
    if (createdInvoice?.invoice?.id) {
      const updateData = { status: 'paid' };
      await testAPI('Finance', 'Update Invoice', 'PUT', `/finance/invoices/${createdInvoice.invoice.id}`, token, updateData);
      await testAPI('Finance', 'Delete Invoice', 'DELETE', `/finance/invoices/${createdInvoice.invoice.id}`, token);
    }
    
    // Test Payments CRUD
    await testAPI('Finance', 'Get Payments', 'GET', '/finance/payments', token);
    
    const newPayment = {
      studentId: 1,
      invoiceId: 1,
      amount: 50000,
      paymentMethod: 'cash',
      transactionId: 'TEST001'
    };
    const createdPayment = await testAPI('Finance', 'Create Payment', 'POST', '/finance/payments', token, newPayment, 201);
    
    if (createdPayment?.payment?.id) {
      await testAPI('Finance', 'Delete Payment', 'DELETE', `/finance/payments/${createdPayment.payment.id}`, token);
    }
    
    // Test Campaigns CRUD
    await testAPI('Finance', 'Get Campaigns', 'GET', '/finance/campaigns', token);
    
    const newCampaign = {
      name: 'Test Campaign',
      description: 'A test marketing campaign',
      targetAudience: 'Test audience',
      budget: 500000,
      startDate: '2024-11-01',
      endDate: '2024-12-31',
      campaignType: 'test'
    };
    const createdCampaign = await testAPI('Finance', 'Create Campaign', 'POST', '/finance/campaigns', token, newCampaign, 201);
    
    if (createdCampaign?.campaign?.id) {
      const updateData = { status: 'paused' };
      await testAPI('Finance', 'Update Campaign', 'PUT', `/finance/campaigns/${createdCampaign.campaign.id}`, token, updateData);
      await testAPI('Finance', 'Delete Campaign', 'DELETE', `/finance/campaigns/${createdCampaign.campaign.id}`, token);
    }
    
  } catch (error) {
    log(`Finance module test error: ${error.message}`, 'error');
  }
}

// Authentication and User Management Tests
async function testAuthModule() {
  log('🔐 Testing Authentication Module...', 'info');
  
  try {
    // Test user registration (public endpoint)
    const newUser = {
      email: 'testuser@ictu.edu.cm',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      role: 'student'
    };
    
    // Note: Registration might be restricted, so we'll test what we can
    await testAPI('Auth', 'Login Admin', 'POST', '/auth/login', null, TEST_USERS.admin);
    await testAPI('Auth', 'Login Student', 'POST', '/auth/login', null, TEST_USERS.student);
    
    // Test protected routes
    const token = authTokens.admin;
    await testAPI('Auth', 'Get Profile', 'GET', '/auth/profile', token);
    
  } catch (error) {
    log(`Auth module test error: ${error.message}`, 'error');
  }
}

// Role-based Access Control Tests
async function testRoleBasedAccess() {
  log('🛡️ Testing Role-based Access Control...', 'info');
  
  try {
    // Test student trying to access admin endpoints (should fail)
    const studentToken = authTokens.student;
    
    try {
      await testAPI('RBAC', 'Student Access Admin Endpoint', 'GET', '/hr/employees', studentToken);
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        recordTest('RBAC', 'Student Access Denied', 'GET', '/hr/employees', true, null, 'Access properly denied');
      } else {
        recordTest('RBAC', 'Student Access Denied', 'GET', '/hr/employees', false, error);
      }
    }
    
    // Test lecturer accessing academic endpoints (should succeed)
    const lecturerToken = authTokens.lecturer;
    await testAPI('RBAC', 'Lecturer Access Academic', 'GET', '/academic/courses', lecturerToken);
    
  } catch (error) {
    log(`RBAC test error: ${error.message}`, 'error');
  }
}

// Main test execution
async function runAllTests() {
  log('🚀 Starting Comprehensive CRUD Operations Test...', 'info');
  log('================================================', 'info');
  
  try {
    // Step 1: Authenticate all test users
    log('Step 1: Authenticating test users...', 'info');
    for (const role of Object.keys(TEST_USERS)) {
      try {
        await authenticateUser(role);
        await sleep(100); // Small delay between requests
      } catch (error) {
        log(`Failed to authenticate ${role}, skipping related tests`, 'warning');
      }
    }
    
    await sleep(1000);
    
    // Step 2: Test all modules
    log('Step 2: Testing all modules...', 'info');
    await testAcademicModule();
    await sleep(500);
    
    await testHRModule();
    await sleep(500);
    
    await testFinanceModule();
    await sleep(500);
    
    await testAuthModule();
    await sleep(500);
    
    await testRoleBasedAccess();
    
    // Step 3: Generate test report
    log('Step 3: Generating test report...', 'info');
    await generateTestReport();
    
    log('================================================', 'info');
    log('🎉 All tests completed!', 'success');
    log(`📊 Results: ${testResults.summary.passed}/${testResults.summary.total} tests passed`, 'info');
    log(`📄 Detailed report saved to: ${TEST_RESULTS_FILE}`, 'info');
    
  } catch (error) {
    log(`❌ Test execution failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Generate comprehensive test report
async function generateTestReport() {
  try {
    // Calculate success rate
    const successRate = testResults.summary.total > 0 
      ? ((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)
      : 0;
    
    testResults.summary.successRate = `${successRate}%`;
    
    // Save detailed results to JSON file
    fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(testResults, null, 2));
    
    // Generate markdown report
    const markdownReport = generateMarkdownReport();
    fs.writeFileSync('CRUD_TEST_REPORT.md', markdownReport);
    
    log('✅ Test reports generated successfully', 'success');
  } catch (error) {
    log(`❌ Failed to generate test report: ${error.message}`, 'error');
  }
}

function generateMarkdownReport() {
  const { summary, modules } = testResults;
  
  let report = `# CRUD Operations Test Report\n\n`;
  report += `**Test Date:** ${testResults.timestamp}\n`;
  report += `**Overall Success Rate:** ${summary.successRate}\n`;
  report += `**Total Tests:** ${summary.total} (${summary.passed} passed, ${summary.failed} failed)\n\n`;
  
  report += `## Summary by Module\n\n`;
  report += `| Module | Total | Passed | Failed | Success Rate |\n`;
  report += `|--------|-------|--------|--------|--------------|\n`;
  
  for (const [moduleName, moduleData] of Object.entries(modules)) {
    const moduleSuccessRate = moduleData.total > 0 
      ? ((moduleData.passed / moduleData.total) * 100).toFixed(1)
      : 0;
    report += `| ${moduleName} | ${moduleData.total} | ${moduleData.passed} | ${moduleData.failed} | ${moduleSuccessRate}% |\n`;
  }
  
  report += `\n## Detailed Test Results\n\n`;
  
  for (const [moduleName, moduleData] of Object.entries(modules)) {
    report += `### ${moduleName} Module\n\n`;
    
    for (const test of moduleData.tests) {
      const status = test.success ? '✅' : '❌';
      report += `${status} **${test.operation}** (${test.method} ${test.endpoint})\n`;
      if (!test.success && test.error) {
        report += `   - Error: ${test.error}\n`;
      }
      report += `\n`;
    }
  }
  
  return report;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    log(`❌ Test execution failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runAllTests, testResults };
