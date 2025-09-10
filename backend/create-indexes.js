// Create Performance Indexes
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'erp_user',
  password: 'erp_password',
  database: 'educational_erp_dev'
});

const indexQueries = [
  // User indexes
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_role ON users (email, role)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_active ON users (role, is_active)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_coordinator ON users (coordinator_type, coordinator_entity_id) WHERE coordinator_type IS NOT NULL',

  // Student indexes
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_matricule ON students (matricule)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_faculty_dept_major ON students (faculty_id, department_id, major_id)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_status_enrollment ON students (status, enrollment_date)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_gpa ON students (gpa) WHERE gpa IS NOT NULL',

  // Course indexes
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_code ON courses (code)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_dept_major ON courses (department_id, major_id)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_semester_year ON courses (semester, year)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_lecturer ON courses (lecturer_id) WHERE lecturer_id IS NOT NULL',

  // Employee indexes
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employees_employee_id ON employees (employee_id)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employees_department ON employees (department)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employees_manager ON employees (manager_id) WHERE manager_id IS NOT NULL',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employees_status ON employees (status)',

  // Enrollment and grade indexes
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_student ON enrollments (student_id)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_course ON enrollments (course_id)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_status ON enrollments (status)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_student ON grades (student_id)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_course ON grades (course_id)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_enrollment ON grades (enrollment_id)',

  // Attendance indexes
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_student ON attendance (student_id)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_course ON attendance (course_id)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_date ON attendance (attendance_date)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_status ON attendance (status)',

  // Faculty/Department/Major indexes
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_faculties_name ON faculties (name)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_faculties_code ON faculties (code)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_departments_name ON departments (name)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_departments_faculty ON departments (faculty_id)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_majors_name ON majors (name)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_majors_department ON majors (department_id)',

  // Timestamp indexes
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_login ON users (last_login) WHERE last_login IS NOT NULL',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_enrollment_date ON students (enrollment_date)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employees_hire_date ON employees (hire_date)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_created_at ON courses (created_at)',

  // Complex composite indexes
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_complex_lookup ON students (faculty_id, department_id, major_id, status)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_complex_lookup ON courses (department_id, major_id, semester, year)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_complex_lookup ON grades (student_id, course_id, academic_year)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_complex_lookup ON attendance (student_id, course_id, attendance_date)',

  // Partial indexes for active records
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active ON users (email, role) WHERE is_active = true',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_active ON students (matricule, faculty_id, department_id) WHERE status = \'active\'',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_courses_active ON courses (code, department_id) WHERE status = \'active\'',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employees_active ON employees (employee_id, department) WHERE status = \'active\''
];

async function createIndexes() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('Creating performance indexes...');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < indexQueries.length; i++) {
      const query = indexQueries[i];
      try {
        console.log('Creating index ' + (i + 1) + ' of ' + indexQueries.length + '...');
        await client.query(query);
        console.log('✅ Index ' + (i + 1) + ' created successfully');
        successCount++;
      } catch (error) {
        console.log('❌ Index ' + (i + 1) + ' failed:', error.message);
        if (error.message.includes('already exists')) {
          console.log('Index already exists, continuing...');
          successCount++;
        } else {
          errorCount++;
        }
      }
    }

    console.log('\n📊 Index Creation Summary:');
    console.log('✅ Successful: ' + successCount + ' indexes');
    console.log('❌ Failed: ' + errorCount + ' indexes');

    if (successCount > 0) {
      console.log('\n🔍 Verifying created indexes...');
      const result = await client.query(`
        SELECT schemaname, tablename, indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND indexname LIKE 'idx_%'
        ORDER BY tablename, indexname
      `);

      console.log('Found ' + result.rows.length + ' performance indexes:');
      result.rows.forEach(row => {
        console.log('  ✅ ' + row.tablename + '.' + row.indexname);
      });
    }

  } catch (error) {
    console.error('❌ Index creation failed:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

// Run the index creation
createIndexes().catch(console.error);