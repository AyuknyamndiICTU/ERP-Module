const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
require('dotenv').config();

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

async function loadBasicTestData() {
  try {
    console.log('🔄 Loading basic test data...');
    await sequelize.authenticate();
    
    // Check if test users already exist
    const [existingUsers] = await sequelize.query("SELECT COUNT(*) as count FROM users WHERE email LIKE '%@ictu.edu.cm'");
    
    if (existingUsers[0].count > 0) {
      console.log('✅ Test users already exist, skipping user creation');
    } else {
      // Create test users with proper password hashing
      const testUsers = [
        { email: 'admin@ictu.edu.cm', password: 'password123', firstName: 'System', lastName: 'Administrator', role: 'admin' },
        { email: 'hr@ictu.edu.cm', password: 'password123', firstName: 'Helen', lastName: 'Tanyi', role: 'hr_staff' },
        { email: 'finance@ictu.edu.cm', password: 'password123', firstName: 'David', lastName: 'Njong', role: 'finance_staff' },
        { email: 'lecturer1@ictu.edu.cm', password: 'password123', firstName: 'Dr. Alice', lastName: 'Nfor', role: 'lecturer' },
        { email: 'student1@ictu.edu.cm', password: 'password123', firstName: 'Ayuk', lastName: 'Nyamndi', role: 'student' },
        { email: 'ict.coordinator@ictu.edu.cm', password: 'password123', firstName: 'Dr. John', lastName: 'Mbah', role: 'faculty_coordinator' }
      ];
      
      console.log('👥 Creating test users...');
      for (const user of testUsers) {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        await sequelize.query(`
          INSERT INTO users (email, password, first_name, last_name, role, is_active, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, true, NOW(), NOW())
          ON CONFLICT (email) DO NOTHING
        `, {
          replacements: [user.email, hashedPassword, user.firstName, user.lastName, user.role]
        });
      }
      console.log(`✅ Created ${testUsers.length} test users`);
    }
    
    // Create basic departments if they don't exist
    const [existingDepts] = await sequelize.query("SELECT COUNT(*) as count FROM departments");
    if (existingDepts[0].count === 0) {
      console.log('🏢 Creating departments...');
      const departments = [
        { name: 'Computer Science', faculty: 'ICT Faculty', description: 'Department of Computer Science' },
        { name: 'Information Technology', faculty: 'ICT Faculty', description: 'Department of Information Technology' },
        { name: 'Business Management', faculty: 'BMS Faculty', description: 'Department of Business Management' }
      ];
      
      for (const dept of departments) {
        await sequelize.query(`
          INSERT INTO departments (name, faculty, description, created_at, updated_at) 
          VALUES (?, ?, ?, NOW(), NOW())
        `, {
          replacements: [dept.name, dept.faculty, dept.description]
        });
      }
      console.log(`✅ Created ${departments.length} departments`);
    }
    
    // Create basic courses if they don't exist
    const [existingCourses] = await sequelize.query("SELECT COUNT(*) as count FROM courses");
    if (existingCourses[0].count === 0) {
      console.log('📚 Creating courses...');
      const courses = [
        { code: 'CS101', courseName: 'Introduction to Programming', description: 'Basic programming concepts', credits: 3, semester: 1, academicYear: '2024/2025', departmentId: 1, difficulty: 'Undergraduate', status: 'active' },
        { code: 'CS201', courseName: 'Data Structures', description: 'Advanced data structures', credits: 4, semester: 1, academicYear: '2024/2025', departmentId: 1, difficulty: 'Undergraduate', status: 'active' }
      ];
      
      for (const course of courses) {
        await sequelize.query(`
          INSERT INTO courses (code, course_name, description, credits, semester, academic_year, department_id, difficulty, status, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, {
          replacements: [course.code, course.courseName, course.description, course.credits, course.semester, course.academicYear, course.departmentId, course.difficulty, course.status]
        });
      }
      console.log(`✅ Created ${courses.length} courses`);
    }
    
    console.log('🎉 Basic test data loaded successfully!');
    
  } catch (error) {
    console.error('❌ Error loading test data:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

loadBasicTestData().catch(console.error);
