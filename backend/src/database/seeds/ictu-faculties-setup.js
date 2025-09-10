const { sequelize } = require('../../config/database');
const Faculty = require('../../models/Faculty');
const Department = require('../../models/Department');
const Major = require('../../models/Major');
const Course = require('../../models/Course');
const User = require('../../models/User');
const { logger } = require('../../utils/logger');

/**
 * Seed ICTU-specific faculties, departments, majors, and courses
 */
const seedICTUData = async () => {
  try {
    logger.info('🌱 Starting ICTU data seeding...');

    // Create coordinators first
    const ictCoordinator = await User.create({
      firstName: 'Dr. John',
      lastName: 'ICT Coordinator',
      email: 'ict.coordinator@ictu.edu.cm',
      password: '$2b$10$rQZ8kqVZ8qVZ8qVZ8qVZ8O', // password123
      role: 'faculty_coordinator',
      coordinatorType: 'faculty',
      isActive: true
    });

    const bmsCoordinator = await User.create({
      firstName: 'Dr. Mary',
      lastName: 'BMS Coordinator',
      email: 'bms.coordinator@ictu.edu.cm',
      password: '$2b$10$rQZ8kqVZ8qVZ8qVZ8qVZ8O', // password123
      role: 'faculty_coordinator',
      coordinatorType: 'faculty',
      isActive: true
    });

    const csCoordinator = await User.create({
      firstName: 'Prof. David',
      lastName: 'CS Department Head',
      email: 'cs.head@ictu.edu.cm',
      password: '$2b$10$rQZ8kqVZ8qVZ8qVZ8qVZ8O', // password123
      role: 'faculty_coordinator',
      coordinatorType: 'department',
      isActive: true
    });

    const itCoordinator = await User.create({
      firstName: 'Dr. Sarah',
      lastName: 'IT Department Head',
      email: 'it.head@ictu.edu.cm',
      password: '$2b$10$rQZ8kqVZ8qVZ8qVZ8qVZ8O', // password123
      role: 'faculty_coordinator',
      coordinatorType: 'department',
      isActive: true
    });

    const baCoordinator = await User.create({
      firstName: 'Dr. Michael',
      lastName: 'Management Head',
      email: 'mgmt.head@ictu.edu.cm',
      password: '$2b$10$rQZ8kqVZ8qVZ8qVZ8qVZ8O', // password123
      role: 'faculty_coordinator',
      coordinatorType: 'department',
      isActive: true
    });

    const mktCoordinator = await User.create({
      firstName: 'Prof. Lisa',
      lastName: 'Marketing Head',
      email: 'marketing.head@ictu.edu.cm',
      password: '$2b$10$rQZ8kqVZ8qVZ8qVZ8qVZ8O', // password123
      role: 'faculty_coordinator',
      coordinatorType: 'department',
      isActive: true
    });

    logger.info('✅ Coordinators created');

    // Create ICT and BMS Faculties
    const ictFaculty = await Faculty.create({
      name: 'Information and Communication Technology',
      code: 'ICT',
      description: 'Faculty of Information and Communication Technology offering programs in Computer Science, Information Technology, and related fields.',
      coordinatorId: ictCoordinator.id,
      status: 'active'
    });

    const bmsFaculty = await Faculty.create({
      name: 'Business and Management Sciences',
      code: 'BMS',
      description: 'Faculty of Business and Management Sciences offering programs in Business Administration, Marketing, and Management.',
      coordinatorId: bmsCoordinator.id,
      status: 'active'
    });

    logger.info('✅ Faculties created');

    // Create Departments for ICT Faculty
    const csDepartment = await Department.create({
      name: 'Computer Science',
      code: 'CS',
      description: 'Department of Computer Science focusing on software development, algorithms, and computational theory.',
      facultyId: ictFaculty.id,
      coordinatorId: csCoordinator.id,
      status: 'active'
    });

    const itDepartment = await Department.create({
      name: 'Information Technology',
      code: 'IT',
      description: 'Department of Information Technology focusing on systems administration, networking, and IT infrastructure.',
      facultyId: ictFaculty.id,
      coordinatorId: itCoordinator.id,
      status: 'active'
    });

    // Create Departments for BMS Faculty
    const baDepartment = await Department.create({
      name: 'Business Administration',
      code: 'BA',
      description: 'Department of Business Administration focusing on management, finance, and business operations.',
      facultyId: bmsFaculty.id,
      coordinatorId: baCoordinator.id,
      status: 'active'
    });

    const mktDepartment = await Department.create({
      name: 'Marketing',
      code: 'MKT',
      description: 'Department of Marketing focusing on digital marketing, consumer behavior, and brand management.',
      facultyId: bmsFaculty.id,
      coordinatorId: mktCoordinator.id,
      status: 'active'
    });

    logger.info('✅ Departments created');

    // Create Majors (Undergraduate, Masters, PhD)
    const bcsMajor = await Major.create({
      name: 'Bachelor of Computer Science',
      code: 'BCS',
      level: 'undergraduate',
      description: 'Undergraduate program in Computer Science',
      facultyId: ictFaculty.id,
      status: 'active'
    });

    const bitMajor = await Major.create({
      name: 'Bachelor of Information Technology',
      code: 'BIT',
      level: 'undergraduate',
      description: 'Undergraduate program in Information Technology',
      facultyId: ictFaculty.id,
      status: 'active'
    });

    const mcsMajor = await Major.create({
      name: 'Master of Computer Science',
      code: 'MCS',
      level: 'masters',
      description: 'Masters program in Computer Science',
      facultyId: ictFaculty.id,
      status: 'active'
    });

    const phcsMajor = await Major.create({
      name: 'PhD in Computer Science',
      code: 'PHCS',
      level: 'phd',
      description: 'Doctoral program in Computer Science',
      facultyId: ictFaculty.id,
      status: 'active'
    });

    const bbaMajor = await Major.create({
      name: 'Bachelor of Business Administration',
      code: 'BBA',
      level: 'undergraduate',
      description: 'Undergraduate program in Business Administration',
      facultyId: bmsFaculty.id,
      status: 'active'
    });

    const bmktMajor = await Major.create({
      name: 'Bachelor of Marketing',
      code: 'BMKT',
      level: 'undergraduate',
      description: 'Undergraduate program in Marketing',
      facultyId: bmsFaculty.id,
      status: 'active'
    });

    const mbaMajor = await Major.create({
      name: 'Master of Business Administration',
      code: 'MBA',
      level: 'masters',
      description: 'Masters program in Business Administration',
      facultyId: bmsFaculty.id,
      status: 'active'
    });

    const phbaMajor = await Major.create({
      name: 'PhD in Business Administration',
      code: 'PHBA',
      level: 'phd',
      description: 'Doctoral program in Business Administration',
      facultyId: bmsFaculty.id,
      status: 'active'
    });

    logger.info('✅ Majors created');

    // Create Courses for ICT Faculty
    const ictCourses = await Course.bulkCreate([
      // Computer Science Department - Semester 1
      {
        courseCode: 'CS101',
        courseName: 'Introduction to Programming',
        description: 'Basic programming concepts using Python',
        credits: 3,
        semester: 1,
        academicYear: 2025,
        department: 'Computer Science',
        maxEnrollment: 50,
        currentEnrollment: 0,
        status: 'active'
      },
      {
        courseCode: 'CS102',
        courseName: 'Mathematics for Computer Science',
        description: 'Mathematical foundations for computer science',
        credits: 3,
        semester: 1,
        academicYear: 2025,
        department: 'Computer Science',
        maxEnrollment: 50,
        currentEnrollment: 0,
        status: 'active'
      },
      {
        courseCode: 'CS103',
        courseName: 'Computer Systems Architecture',
        description: 'Introduction to computer hardware and systems',
        credits: 3,
        semester: 1,
        academicYear: 2025,
        department: 'Computer Science',
        maxEnrollment: 40,
        currentEnrollment: 0,
        status: 'active'
      },
      // Computer Science Department - Semester 2
      {
        courseCode: 'CS201',
        courseName: 'Data Structures and Algorithms',
        description: 'Advanced data structures and algorithm design',
        credits: 4,
        semester: 2,
        academicYear: 2025,
        department: 'Computer Science',
        maxEnrollment: 45,
        currentEnrollment: 0,
        prerequisites: ['CS101'],
        status: 'active'
      },
      {
        courseCode: 'CS202',
        courseName: 'Object-Oriented Programming',
        description: 'Object-oriented programming concepts using Java',
        credits: 3,
        semester: 2,
        academicYear: 2025,
        department: 'Computer Science',
        maxEnrollment: 45,
        currentEnrollment: 0,
        prerequisites: ['CS101'],
        status: 'active'
      },
      // Information Technology Department - Semester 1
      {
        courseCode: 'IT101',
        courseName: 'Introduction to Information Technology',
        description: 'Overview of IT concepts and applications',
        credits: 3,
        semester: 1,
        academicYear: 2025,
        department: 'Information Technology',
        maxEnrollment: 50,
        currentEnrollment: 0,
        status: 'active'
      },
      {
        courseCode: 'IT102',
        courseName: 'Network Fundamentals',
        description: 'Basic networking concepts and protocols',
        credits: 3,
        semester: 1,
        academicYear: 2025,
        department: 'Information Technology',
        maxEnrollment: 40,
        currentEnrollment: 0,
        status: 'active'
      },
      // Information Technology Department - Semester 2
      {
        courseCode: 'IT201',
        courseName: 'Database Management Systems',
        description: 'Database design and management',
        credits: 4,
        semester: 2,
        academicYear: 2025,
        department: 'Information Technology',
        maxEnrollment: 40,
        currentEnrollment: 0,
        prerequisites: ['IT101'],
        status: 'active'
      }
    ], { ignoreDuplicates: true });

    // Create Courses for BMS Faculty
    const bmsCourses = await Course.bulkCreate([
      // Business Administration Department - Semester 1
      {
        courseCode: 'BA101',
        courseName: 'Principles of Management',
        description: 'Fundamental principles of business management',
        credits: 3,
        semester: 1,
        academicYear: 2025,
        department: 'Business Administration',
        maxEnrollment: 60,
        currentEnrollment: 0,
        status: 'active'
      },
      {
        courseCode: 'BA102',
        courseName: 'Business Mathematics',
        description: 'Mathematical applications in business',
        credits: 3,
        semester: 1,
        academicYear: 2025,
        department: 'Business Administration',
        maxEnrollment: 60,
        currentEnrollment: 0,
        status: 'active'
      },
      {
        courseCode: 'BA103',
        courseName: 'Introduction to Economics',
        description: 'Basic economic principles and concepts',
        credits: 3,
        semester: 1,
        academicYear: 2025,
        department: 'Business Administration',
        maxEnrollment: 60,
        currentEnrollment: 0,
        status: 'active'
      },
      // Business Administration Department - Semester 2
      {
        courseCode: 'BA201',
        courseName: 'Financial Accounting',
        description: 'Principles of financial accounting',
        credits: 4,
        semester: 2,
        academicYear: 2025,
        department: 'Business Administration',
        maxEnrollment: 50,
        currentEnrollment: 0,
        prerequisites: ['BA102'],
        status: 'active'
      },
      {
        courseCode: 'BA202',
        courseName: 'Organizational Behavior',
        description: 'Human behavior in organizational settings',
        credits: 3,
        semester: 2,
        academicYear: 2025,
        department: 'Business Administration',
        maxEnrollment: 50,
        currentEnrollment: 0,
        prerequisites: ['BA101'],
        status: 'active'
      },
      // Marketing Department - Semester 1
      {
        courseCode: 'MKT101',
        courseName: 'Principles of Marketing',
        description: 'Fundamental marketing concepts and strategies',
        credits: 3,
        semester: 1,
        academicYear: 2025,
        department: 'Marketing',
        maxEnrollment: 50,
        currentEnrollment: 0,
        status: 'active'
      },
      {
        courseCode: 'MKT102',
        courseName: 'Consumer Behavior',
        description: 'Understanding consumer psychology and behavior',
        credits: 3,
        semester: 1,
        academicYear: 2025,
        department: 'Marketing',
        maxEnrollment: 50,
        currentEnrollment: 0,
        status: 'active'
      },
      // Marketing Department - Semester 2
      {
        courseCode: 'MKT201',
        courseName: 'Digital Marketing',
        description: 'Online marketing strategies and tools',
        credits: 4,
        semester: 2,
        academicYear: 2025,
        department: 'Marketing',
        maxEnrollment: 45,
        currentEnrollment: 0,
        prerequisites: ['MKT101'],
        status: 'active'
      }
    ], { ignoreDuplicates: true });

    console.log('✅ Courses created');

    console.log('🎉 ICTU data seeding completed successfully!');
    console.log(`
📊 Summary:
- Faculties: 2 (ICT, BMS)
- Departments: 4 (CS, IT, BA, MKT)
- Majors: 8 (4 per faculty across undergraduate/masters/phd)
- Courses: ${ictCourses.length + bmsCourses.length} courses
- Coordinators: 6 users
    `);

  } catch (error) {
    console.error('❌ Error seeding ICTU data:', error);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedICTUData()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedICTUData };
