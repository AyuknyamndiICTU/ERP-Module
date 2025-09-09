const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const Faculty = require('./src/models/Faculty');
const Department = require('./src/models/Department');
const Major = require('./src/models/Major');
const { logger } = require('./src/utils/logger');

const seedICTUData = async () => {
  try {
    console.log('🚀 Starting ICTU database initialization...');
    
    // Connect and sync database
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    await sequelize.sync({ force: true }); // This will recreate all tables
    console.log('✅ Database tables created');

    // Create admin users
    console.log('👤 Creating admin users...');
    
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      email: 'admin@ictu.edu.cm',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'system_admin',
      isActive: true
    });

    const facultyPassword = await bcrypt.hash('faculty123', 12);
    const facultyCoord = await User.create({
      email: 'faculty@ictu.edu.cm',
      password: facultyPassword,
      firstName: 'Faculty',
      lastName: 'Coordinator',
      role: 'faculty_coordinator',
      coordinatorType: 'faculty',
      isActive: true
    });

    const studentPassword = await bcrypt.hash('student123', 12);
    const student = await User.create({
      email: 'student@ictu.edu.cm',
      password: studentPassword,
      firstName: 'Test',
      lastName: 'Student',
      role: 'student',
      isActive: true
    });

    const financePassword = await bcrypt.hash('finance123', 12);
    const finance = await User.create({
      email: 'finance@ictu.edu.cm',
      password: financePassword,
      firstName: 'Finance',
      lastName: 'Staff',
      role: 'finance_staff',
      isActive: true
    });

    console.log('✅ Admin users created');

    // Create ICTU Faculties
    console.log('🏫 Creating ICTU faculties...');
    
    const ictFaculty = await Faculty.create({
      name: 'Information and Communication Technology',
      code: 'ICT',
      description: 'Faculty of Information and Communication Technology offering cutting-edge technology programs',
      coordinatorId: facultyCoord.id,
      status: 'active'
    });

    const bmsFaculty = await Faculty.create({
      name: 'Business and Management Sciences',
      code: 'BMS',
      description: 'Faculty of Business and Management Sciences offering comprehensive business education',
      status: 'active'
    });

    console.log('✅ Faculties created');

    // Create Majors
    console.log('🎓 Creating academic majors...');
    
    const undergraduateMajor = await Major.create({
      name: 'Undergraduate Programs',
      code: 'UG',
      level: 'undergraduate',
      description: 'Bachelor degree programs',
      status: 'active'
    });

    const mastersMajor = await Major.create({
      name: 'Masters Programs',
      code: 'MS',
      level: 'masters',
      description: 'Master degree programs',
      status: 'active'
    });

    const phdMajor = await Major.create({
      name: 'PhD Programs',
      code: 'PHD',
      level: 'phd',
      description: 'Doctoral degree programs',
      status: 'active'
    });

    console.log('✅ Majors created');

    // Create ICT Departments
    console.log('🏢 Creating ICT departments...');
    
    const softwareEngineeringDept = await Department.create({
      name: 'Software Engineering',
      code: 'SE',
      facultyId: ictFaculty.id,
      description: 'Department of Software Engineering and Development',
      status: 'active'
    });

    const computerScienceDept = await Department.create({
      name: 'Computer Science',
      code: 'CS',
      facultyId: ictFaculty.id,
      description: 'Department of Computer Science and Information Systems',
      status: 'active'
    });

    const networkingDept = await Department.create({
      name: 'Networking and Cybersecurity',
      code: 'NC',
      facultyId: ictFaculty.id,
      description: 'Department of Network Administration and Cybersecurity',
      status: 'active'
    });

    const itManagementDept = await Department.create({
      name: 'IT Management',
      code: 'ITM',
      facultyId: ictFaculty.id,
      description: 'Department of Information Technology Management',
      status: 'active'
    });

    // Create BMS Departments
    console.log('🏢 Creating BMS departments...');
    
    const businessAdminDept = await Department.create({
      name: 'Business Administration',
      code: 'BA',
      facultyId: bmsFaculty.id,
      description: 'Department of Business Administration and Management',
      status: 'active'
    });

    const accountingDept = await Department.create({
      name: 'Accounting and Finance',
      code: 'AF',
      facultyId: bmsFaculty.id,
      description: 'Department of Accounting and Financial Management',
      status: 'active'
    });

    const marketingDept = await Department.create({
      name: 'Marketing and Sales',
      code: 'MS',
      facultyId: bmsFaculty.id,
      description: 'Department of Marketing and Sales Management',
      status: 'active'
    });

    const hrDept = await Department.create({
      name: 'Human Resource Management',
      code: 'HRM',
      facultyId: bmsFaculty.id,
      description: 'Department of Human Resource Management',
      status: 'active'
    });

    const projectManagementDept = await Department.create({
      name: 'Project Management',
      code: 'PM',
      facultyId: bmsFaculty.id,
      description: 'Department of Project Management and Operations',
      status: 'active'
    });

    console.log('✅ Departments created');

    // Summary
    console.log('\n🎉 ICTU Database Initialization Complete!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${await User.count()}`);
    console.log(`🏫 Faculties: ${await Faculty.count()}`);
    console.log(`🏢 Departments: ${await Department.count()}`);
    console.log(`🎓 Majors: ${await Major.count()}`);
    
    console.log('\n🔐 Login Credentials:');
    console.log('📧 Admin: admin@ictu.edu.cm / admin123');
    console.log('📧 Faculty Coordinator: faculty@ictu.edu.cm / faculty123');
    console.log('📧 Student: student@ictu.edu.cm / student123');
    console.log('📧 Finance Staff: finance@ictu.edu.cm / finance123');
    
    console.log('\n🚀 System is ready! Start the server with: npm start');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

seedICTUData();
