#!/usr/bin/env node

/**
 * Load Sample Data Script
 * Loads comprehensive test data into the Educational ERP database
 */

const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

// Database connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'educational_erp',
  process.env.DB_USER || 'postgres', 
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

// Sample data
const sampleData = {
  users: [
    // System Administrators
    { email: 'admin@ictu.edu.cm', password: 'password123', firstName: 'System', lastName: 'Administrator', role: 'admin', isActive: true },
    { email: 'sysadmin@ictu.edu.cm', password: 'password123', firstName: 'Tech', lastName: 'Support', role: 'system_admin', isActive: true },
    
    // Faculty Coordinators
    { email: 'ict.coordinator@ictu.edu.cm', password: 'password123', firstName: 'Dr. John', lastName: 'Mbah', role: 'faculty_coordinator', isActive: true },
    { email: 'bms.coordinator@ictu.edu.cm', password: 'password123', firstName: 'Dr. Mary', lastName: 'Fon', role: 'faculty_coordinator', isActive: true },
    
    // Major Coordinators
    { email: 'undergrad.coordinator@ictu.edu.cm', password: 'password123', firstName: 'Prof. David', lastName: 'Tabi', role: 'major_coordinator', isActive: true },
    { email: 'masters.coordinator@ictu.edu.cm', password: 'password123', firstName: 'Dr. Sarah', lastName: 'Nkeng', role: 'major_coordinator', isActive: true },
    { email: 'phd.coordinator@ictu.edu.cm', password: 'password123', firstName: 'Prof. Michael', lastName: 'Ashu', role: 'major_coordinator', isActive: true },
    
    // Lecturers
    { email: 'lecturer1@ictu.edu.cm', password: 'password123', firstName: 'Dr. Alice', lastName: 'Nfor', role: 'lecturer', isActive: true },
    { email: 'lecturer2@ictu.edu.cm', password: 'password123', firstName: 'Prof. Bob', lastName: 'Che', role: 'lecturer', isActive: true },
    { email: 'lecturer3@ictu.edu.cm', password: 'password123', firstName: 'Dr. Carol', lastName: 'Bih', role: 'lecturer', isActive: true },
    
    // Staff
    { email: 'hr@ictu.edu.cm', password: 'password123', firstName: 'Helen', lastName: 'Tanyi', role: 'hr_staff', isActive: true },
    { email: 'finance@ictu.edu.cm', password: 'password123', firstName: 'David', lastName: 'Njong', role: 'finance_staff', isActive: true },
    { email: 'marketing@ictu.edu.cm', password: 'password123', firstName: 'Jennifer', lastName: 'Fru', role: 'marketing_staff', isActive: true },
    
    // Students
    { email: 'student1@ictu.edu.cm', password: 'password123', firstName: 'Ayuk', lastName: 'Nyamndi', role: 'student', isActive: true },
    { email: 'student2@ictu.edu.cm', password: 'password123', firstName: 'Brice', lastName: 'Tamfu', role: 'student', isActive: true },
    { email: 'student3@ictu.edu.cm', password: 'password123', firstName: 'Clara', lastName: 'Mbong', role: 'student', isActive: true },
    { email: 'student4@ictu.edu.cm', password: 'password123', firstName: 'Divine', lastName: 'Kum', role: 'student', isActive: true },
    { email: 'student5@ictu.edu.cm', password: 'password123', firstName: 'Emmanuel', lastName: 'Fon', role: 'student', isActive: true }
  ],
  
  departments: [
    { name: 'Computer Science', faculty: 'ICT Faculty', description: 'Department of Computer Science and Software Engineering' },
    { name: 'Information Technology', faculty: 'ICT Faculty', description: 'Department of Information Technology and Systems' },
    { name: 'Business Management', faculty: 'BMS Faculty', description: 'Department of Business Management and Administration' },
    { name: 'Marketing', faculty: 'BMS Faculty', description: 'Department of Marketing and Sales' },
    { name: 'Finance', faculty: 'BMS Faculty', description: 'Department of Finance and Accounting' }
  ],
  
  courses: [
    { code: 'CS101', courseName: 'Introduction to Programming', description: 'Basic programming concepts using Python', credits: 3, semester: 1, academicYear: '2024/2025', departmentId: 1, difficulty: 'Undergraduate', lecturerId: 8, maxEnrollment: 30, currentEnrollment: 25, status: 'active' },
    { code: 'CS201', courseName: 'Data Structures and Algorithms', description: 'Advanced data structures and algorithm design', credits: 4, semester: 1, academicYear: '2024/2025', departmentId: 1, difficulty: 'Undergraduate', lecturerId: 9, maxEnrollment: 25, currentEnrollment: 20, status: 'active' },
    { code: 'CS301', courseName: 'Database Systems', description: 'Relational database design and SQL', credits: 3, semester: 1, academicYear: '2024/2025', departmentId: 1, difficulty: 'Undergraduate', lecturerId: 10, maxEnrollment: 30, currentEnrollment: 18, status: 'active' },
    { code: 'IT101', courseName: 'Computer Networks', description: 'Network protocols and architecture', credits: 3, semester: 1, academicYear: '2024/2025', departmentId: 2, difficulty: 'Undergraduate', lecturerId: 9, maxEnrollment: 25, currentEnrollment: 22, status: 'active' },
    { code: 'BM101', courseName: 'Principles of Management', description: 'Basic management theories and practices', credits: 3, semester: 1, academicYear: '2024/2025', departmentId: 3, difficulty: 'Undergraduate', lecturerId: 8, maxEnrollment: 35, currentEnrollment: 30, status: 'active' }
  ]
};

async function loadSampleData() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await sequelize.query('TRUNCATE TABLE attendance, grades, enrollments, assignments, exams, courses, invoices, payments, campaigns, employees, students, departments, users RESTART IDENTITY CASCADE');
    
    // Load Users
    console.log('👥 Loading users...');
    for (const userData of sampleData.users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      await sequelize.query(`
        INSERT INTO users (email, password, first_name, last_name, role, is_active, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [userData.email, hashedPassword, userData.firstName, userData.lastName, userData.role, userData.isActive]
      });
    }
    console.log(`✅ Loaded ${sampleData.users.length} users`);
    
    // Load Departments
    console.log('🏢 Loading departments...');
    for (const dept of sampleData.departments) {
      await sequelize.query(`
        INSERT INTO departments (name, faculty, description, created_at, updated_at) 
        VALUES (?, ?, ?, NOW(), NOW())
      `, {
        replacements: [dept.name, dept.faculty, dept.description]
      });
    }
    console.log(`✅ Loaded ${sampleData.departments.length} departments`);
    
    // Load Students
    console.log('🎓 Loading students...');
    const students = [
      { matricule: 'ICTU20241001', userId: 14, dateOfBirth: '2002-05-15', gender: 'Male', phone: '+237670123456', address: 'Bamenda, NW Region', departmentId: 1, level: 'Undergraduate', semester: 1, academicYear: '2024/2025', status: 'active', registrationLocked: true },
      { matricule: 'ICTU20241002', userId: 15, dateOfBirth: '2001-08-22', gender: 'Male', phone: '+237680234567', address: 'Douala, LT Region', departmentId: 1, level: 'Undergraduate', semester: 1, academicYear: '2024/2025', status: 'active', registrationLocked: true },
      { matricule: 'ICTU20241003', userId: 16, dateOfBirth: '2003-03-10', gender: 'Female', phone: '+237690345678', address: 'Yaounde, CE Region', departmentId: 2, level: 'Undergraduate', semester: 1, academicYear: '2024/2025', status: 'active', registrationLocked: true },
      { matricule: 'ICTU20241004', userId: 17, dateOfBirth: '2002-11-05', gender: 'Female', phone: '+237650456789', address: 'Buea, SW Region', departmentId: 3, level: 'Undergraduate', semester: 1, academicYear: '2024/2025', status: 'active', registrationLocked: true },
      { matricule: 'ICTU20241005', userId: 18, dateOfBirth: '2001-07-18', gender: 'Male', phone: '+237660567890', address: 'Bafoussam, WE Region', departmentId: 4, level: 'Masters', semester: 1, academicYear: '2024/2025', status: 'active', registrationLocked: true }
    ];
    
    for (const student of students) {
      await sequelize.query(`
        INSERT INTO students (matricule, user_id, date_of_birth, gender, phone, address, department_id, level, semester, academic_year, status, registration_locked, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [student.matricule, student.userId, student.dateOfBirth, student.gender, student.phone, student.address, student.departmentId, student.level, student.semester, student.academicYear, student.status, student.registrationLocked]
      });
    }
    console.log(`✅ Loaded ${students.length} students`);
    
    // Load Courses
    console.log('📚 Loading courses...');
    for (const course of sampleData.courses) {
      await sequelize.query(`
        INSERT INTO courses (code, course_name, description, credits, semester, academic_year, department_id, difficulty, lecturer_id, max_enrollment, current_enrollment, status, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [course.code, course.courseName, course.description, course.credits, course.semester, course.academicYear, course.departmentId, course.difficulty, course.lecturerId, course.maxEnrollment, course.currentEnrollment, course.status]
      });
    }
    console.log(`✅ Loaded ${sampleData.courses.length} courses`);
    
    // Load Employees
    console.log('👨‍💼 Loading employees...');
    const employees = [
      { employeeId: 'EMP001', userId: 3, departmentId: 1, position: 'Faculty Coordinator', salary: 2500000, hireDate: '2020-01-15', employmentType: 'full_time', status: 'active', phone: '+237670111222', address: 'Mile 4 Nkwen, Bamenda', emergencyContact: 'Mrs. Mbah', emergencyPhone: '+237680111333' },
      { employeeId: 'EMP002', userId: 11, departmentId: 1, position: 'HR Manager', salary: 1400000, hireDate: '2020-06-15', employmentType: 'full_time', status: 'active', phone: '+237670666777', address: 'Commercial Avenue, Bamenda', emergencyContact: 'Mr. Tanyi', emergencyPhone: '+237680666888' },
      { employeeId: 'EMP003', userId: 12, departmentId: 1, position: 'Finance Manager', salary: 1500000, hireDate: '2019-11-20', employmentType: 'full_time', status: 'active', phone: '+237680777888', address: 'Akwa, Douala', emergencyContact: 'Mrs. Njong', emergencyPhone: '+237690777999' }
    ];
    
    for (const emp of employees) {
      await sequelize.query(`
        INSERT INTO employees (employee_id, user_id, department_id, position, salary, hire_date, employment_type, status, phone, address, emergency_contact, emergency_phone, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [emp.employeeId, emp.userId, emp.departmentId, emp.position, emp.salary, emp.hireDate, emp.employmentType, emp.status, emp.phone, emp.address, emp.emergencyContact, emp.emergencyPhone]
      });
    }
    console.log(`✅ Loaded ${employees.length} employees`);
    
    // Load Invoices
    console.log('💰 Loading invoices...');
    const invoices = [
      { studentId: 1, amount: 450000, description: 'Tuition Fee - Semester 1', dueDate: '2024-12-31', status: 'pending', academicYear: '2024/2025', semester: 1 },
      { studentId: 2, amount: 450000, description: 'Tuition Fee - Semester 1', dueDate: '2024-12-31', status: 'paid', academicYear: '2024/2025', semester: 1 },
      { studentId: 3, amount: 450000, description: 'Tuition Fee - Semester 1', dueDate: '2024-12-31', status: 'pending', academicYear: '2024/2025', semester: 1 }
    ];
    
    for (const invoice of invoices) {
      await sequelize.query(`
        INSERT INTO invoices (student_id, amount, description, due_date, status, academic_year, semester, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [invoice.studentId, invoice.amount, invoice.description, invoice.dueDate, invoice.status, invoice.academicYear, invoice.semester]
      });
    }
    console.log(`✅ Loaded ${invoices.length} invoices`);
    
    // Load Campaigns
    console.log('📢 Loading campaigns...');
    const campaigns = [
      { name: 'ICTU 2025 Enrollment Drive', description: 'Comprehensive enrollment campaign for 2025 academic year', targetAudience: 'High school graduates', budget: 5000000, startDate: '2024-11-01', endDate: '2025-02-28', status: 'active', campaignType: 'enrollment', createdBy: 13, metrics: '{"impressions": 15000, "clicks": 1200, "conversions": 85}' },
      { name: 'Digital Transformation Workshop', description: 'Promote ICT skills development workshops', targetAudience: 'Working professionals', budget: 2000000, startDate: '2024-10-15', endDate: '2024-12-15', status: 'active', campaignType: 'workshop', createdBy: 13, metrics: '{"impressions": 8000, "clicks": 650, "conversions": 45}' }
    ];
    
    for (const campaign of campaigns) {
      await sequelize.query(`
        INSERT INTO campaigns (name, description, target_audience, budget, start_date, end_date, status, campaign_type, created_by, metrics, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [campaign.name, campaign.description, campaign.targetAudience, campaign.budget, campaign.startDate, campaign.endDate, campaign.status, campaign.campaignType, campaign.createdBy, campaign.metrics]
      });
    }
    console.log(`✅ Loaded ${campaigns.length} campaigns`);
    
    console.log('🎉 Sample data loaded successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${sampleData.users.length}`);
    console.log(`   - Departments: ${sampleData.departments.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Courses: ${sampleData.courses.length}`);
    console.log(`   - Employees: ${employees.length}`);
    console.log(`   - Invoices: ${invoices.length}`);
    console.log(`   - Campaigns: ${campaigns.length}`);
    
  } catch (error) {
    console.error('❌ Error loading sample data:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the script
if (require.main === module) {
  loadSampleData().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { loadSampleData };
