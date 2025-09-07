const bcrypt = require('bcryptjs');
const { User, Student, Course, Employee, FeeStructure } = require('../models');
const { logger } = require('../utils/logger');

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');

    // Create test users with demo credentials
    const users = await User.bulkCreate([
      {
        email: 'admin@erp.local',
        password: await bcrypt.hash('password123', 12),
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true
      },
      {
        email: 'alice.student@erp.local',
        password: await bcrypt.hash('password123', 12),
        firstName: 'Alice',
        lastName: 'Student',
        role: 'student',
        isActive: true
      },
      {
        email: 'john.professor@erp.local',
        password: await bcrypt.hash('password123', 12),
        firstName: 'John',
        lastName: 'Professor',
        role: 'academic_staff',
        isActive: true
      },
      {
        email: 'hr.manager@erp.local',
        password: await bcrypt.hash('password123', 12),
        firstName: 'HR',
        lastName: 'Manager',
        role: 'hr_personnel',
        isActive: true
      },
      {
        email: 'finance.manager@erp.local',
        password: await bcrypt.hash('password123', 12),
        firstName: 'Finance',
        lastName: 'Manager',
        role: 'finance_staff',
        isActive: true
      }
    ], { ignoreDuplicates: true });

    logger.info(`Created ${users.length} users`);

    // Create test students
    const students = await Student.bulkCreate([
      {
        studentId: 'STU001',
        userId: users[1].id, // student user
        firstName: 'Alice',
        lastName: 'Student',
        email: 'alice.student@erp.local',
        phone: '+1234567890',
        dateOfBirth: '2000-01-15',
        gender: 'male',
        address: { street: '123 Main St', city: 'City', state: 'State', zip: '12345' },
        programId: 1,
        yearLevel: 2,
        enrollmentDate: '2024-01-15',
        status: 'active'
      },
      {
        studentId: 'STU002',
        userId: users[1].id,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@student.edu',
        phone: '+1234567891',
        dateOfBirth: '2001-03-20',
        gender: 'female',
        address: { street: '456 Oak Ave', city: 'City', state: 'State', zip: '12346' },
        programId: 1,
        yearLevel: 1,
        enrollmentDate: '2024-01-15',
        status: 'active'
      }
    ], { ignoreDuplicates: true });

    logger.info(`Created ${students.length} students`);

    // Create test courses
    const courses = await Course.bulkCreate([
      {
        courseCode: 'CS101',
        courseName: 'Introduction to Computer Science',
        description: 'Basic concepts of computer science and programming',
        credits: 3,
        department: 'Computer Science',
        semester: 'Fall 2024',
        academicYear: '2024-2025',
        maxEnrollment: 30,
        currentEnrollment: 0,
        prerequisites: [],
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          time: '10:00-11:00',
          room: 'CS-101'
        },
        instructorId: users[2].id, // faculty user
        status: 'active'
      },
      {
        courseCode: 'MATH201',
        courseName: 'Calculus II',
        description: 'Advanced calculus concepts',
        credits: 4,
        department: 'Mathematics',
        semester: 'Fall 2024',
        academicYear: '2024-2025',
        maxEnrollment: 25,
        currentEnrollment: 0,
        prerequisites: ['MATH101'],
        schedule: {
          days: ['Tuesday', 'Thursday'],
          time: '14:00-16:00',
          room: 'MATH-201'
        },
        instructorId: users[2].id,
        status: 'active'
      }
    ], { ignoreDuplicates: true });

    logger.info(`Created ${courses.length} courses`);

    // Create test employees
    const employees = await Employee.bulkCreate([
      {
        employeeId: 'EMP001',
        userId: users[2].id, // faculty user
        firstName: 'John',
        lastName: 'Professor',
        email: 'john.professor@erp.local',
        phone: '+1234567892',
        department: 'Computer Science',
        position: 'Assistant Professor',
        hireDate: '2023-08-15',
        salary: 75000.00,
        employmentType: 'full-time',
        status: 'active',
        address: { street: '789 Faculty St', city: 'City', state: 'State', zip: '12347' },
        emergencyContact: { name: 'Emergency Contact', phone: '+1234567893', relationship: 'spouse' }
      },
      {
        employeeId: 'EMP002',
        userId: users[3].id, // hr user
        firstName: 'HR',
        lastName: 'Manager',
        email: 'hr.manager@erp.local',
        phone: '+1234567894',
        department: 'Human Resources',
        position: 'HR Manager',
        hireDate: '2022-01-10',
        salary: 65000.00,
        employmentType: 'full-time',
        status: 'active',
        address: { street: '321 HR Ave', city: 'City', state: 'State', zip: '12348' },
        emergencyContact: { name: 'HR Emergency', phone: '+1234567895', relationship: 'parent' }
      }
    ], { ignoreDuplicates: true });

    logger.info(`Created ${employees.length} employees`);

    // Create test fee structures
    const feeStructures = await FeeStructure.bulkCreate([
      {
        name: 'Undergraduate Tuition 2024-2025',
        academicYear: '2024-2025',
        semester: 'Fall',
        program: 'Computer Science',
        feeComponents: [
          { name: 'Tuition Fee', amount: 5000.00, type: 'mandatory' },
          { name: 'Lab Fee', amount: 300.00, type: 'mandatory' },
          { name: 'Library Fee', amount: 100.00, type: 'optional' },
          { name: 'Student Activities', amount: 50.00, type: 'optional' }
        ],
        totalAmount: 5450.00,
        dueDate: '2024-08-15',
        status: 'active'
      },
      {
        name: 'Graduate Tuition 2024-2025',
        academicYear: '2024-2025',
        semester: 'Fall',
        program: 'Graduate Programs',
        feeComponents: [
          { name: 'Tuition Fee', amount: 7000.00, type: 'mandatory' },
          { name: 'Research Fee', amount: 500.00, type: 'mandatory' },
          { name: 'Library Fee', amount: 100.00, type: 'optional' }
        ],
        totalAmount: 7600.00,
        dueDate: '2024-08-15',
        status: 'active'
      }
    ], { ignoreDuplicates: true });

    logger.info(`Created ${feeStructures.length} fee structures`);

    logger.info('Database seeding completed successfully');
    return true;

  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  }
};

module.exports = { seedDatabase };
