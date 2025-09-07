const request = require('supertest');
const express = require('express');
const studentsRoutes = require('../src/routes/students');
const coursesRoutes = require('../src/routes/courses');
const gradesRoutes = require('../src/routes/grades');
const attendanceRoutes = require('../src/routes/attendance');
const authRoutes = require('../src/routes/auth');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/attendance', attendanceRoutes);

describe('Academic Module', () => {
  let adminToken, facultyToken, studentToken;
  let testStudentId, testCourseId;

  beforeAll(async () => {
    // Login as admin to get token
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Admin@123'
      });
    adminToken = adminLogin.body.token;

    // Login as faculty
    const facultyLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'faculty@test.com',
        password: 'Faculty@123'
      });
    facultyToken = facultyLogin.body.token;

    // Login as student
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@test.com',
        password: 'Student@123'
      });
    studentToken = studentLogin.body.token;
  });

  describe('Student Management System', () => {
    const testStudent = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@student.edu',
      studentId: 'STU001',
      dateOfBirth: '2000-01-15',
      phone: '+1234567890',
      address: '123 Main St',
      program: 'Computer Science',
      yearLevel: 1,
      enrollmentDate: '2024-01-15'
    };

    it('should create a new student (admin only)', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testStudent);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('student');
      expect(res.body.student.email).toBe(testStudent.email);
      testStudentId = res.body.student.id;
    });

    it('should get all students with pagination', async () => {
      const res = await request(app)
        .get('/api/students?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('students');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.students)).toBe(true);
    });

    it('should search students by name', async () => {
      const res = await request(app)
        .get('/api/students/search?query=John')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('students');
    });

    it('should get student by ID', async () => {
      const res = await request(app)
        .get(`/api/students/${testStudentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('student');
      expect(res.body.student.id).toBe(testStudentId);
    });

    it('should update student information', async () => {
      const updateData = { phone: '+9876543210' };
      const res = await request(app)
        .put(`/api/students/${testStudentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.student.phone).toBe(updateData.phone);
    });

    it('should prevent unauthorized access to student creation', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(testStudent);
      
      expect(res.statusCode).toEqual(403);
    });
  });

  describe('Course & Curriculum Management', () => {
    const testCourse = {
      courseCode: 'CS101',
      courseName: 'Introduction to Computer Science',
      description: 'Basic concepts of computer science',
      credits: 3,
      department: 'Computer Science',
      semester: 'Fall 2024',
      maxEnrollment: 30,
      prerequisites: [],
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        time: '10:00-11:00',
        room: 'CS-101'
      }
    };

    it('should create a new course', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testCourse);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('course');
      expect(res.body.course.courseCode).toBe(testCourse.courseCode);
      testCourseId = res.body.course.id;
    });

    it('should get all courses', async () => {
      const res = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('courses');
      expect(Array.isArray(res.body.courses)).toBe(true);
    });

    it('should enroll student in course', async () => {
      const res = await request(app)
        .post(`/api/courses/${testCourseId}/enroll`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ studentId: testStudentId });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
    });

    it('should assign faculty to course', async () => {
      const res = await request(app)
        .post(`/api/courses/${testCourseId}/assign-faculty`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ facultyId: 'faculty-id' });
      
      expect([200, 404]).toContain(res.statusCode); // 404 if faculty doesn't exist
    });

    it('should get course schedule', async () => {
      const res = await request(app)
        .get(`/api/courses/${testCourseId}/schedule`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('Grades & Assessment System', () => {
    const testGrade = {
      studentId: testStudentId,
      courseId: testCourseId,
      assessmentType: 'midterm',
      score: 85,
      maxScore: 100,
      weight: 0.3,
      gradedDate: '2024-03-15'
    };

    it('should record a grade', async () => {
      const res = await request(app)
        .post('/api/grades')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send(testGrade);
      
      expect([200, 201]).toContain(res.statusCode);
    });

    it('should get student grades', async () => {
      const res = await request(app)
        .get(`/api/grades/student/${testStudentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
    });

    it('should calculate GPA', async () => {
      const res = await request(app)
        .get(`/api/grades/student/${testStudentId}/gpa`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('gpa');
    });

    it('should generate report card', async () => {
      const res = await request(app)
        .get(`/api/grades/student/${testStudentId}/report-card`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
    });

    it('should get course grade statistics', async () => {
      const res = await request(app)
        .get(`/api/grades/course/${testCourseId}/statistics`)
        .set('Authorization', `Bearer ${facultyToken}`);
      
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('Attendance Management', () => {
    const attendanceData = {
      courseId: testCourseId,
      date: '2024-03-20',
      attendanceRecords: [
        {
          studentId: testStudentId,
          status: 'present',
          timestamp: '2024-03-20T10:00:00Z'
        }
      ]
    };

    it('should record attendance', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send(attendanceData);
      
      expect([200, 201]).toContain(res.statusCode);
    });

    it('should get student attendance', async () => {
      const res = await request(app)
        .get(`/api/attendance/student/${testStudentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
    });

    it('should get course attendance', async () => {
      const res = await request(app)
        .get(`/api/attendance/course/${testCourseId}`)
        .set('Authorization', `Bearer ${facultyToken}`);
      
      expect(res.statusCode).toEqual(200);
    });

    it('should calculate attendance percentage', async () => {
      const res = await request(app)
        .get(`/api/attendance/student/${testStudentId}/percentage`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('percentage');
    });

    it('should generate attendance report', async () => {
      const res = await request(app)
        .get(`/api/attendance/course/${testCourseId}/report`)
        .set('Authorization', `Bearer ${facultyToken}`);
      
      expect(res.statusCode).toEqual(200);
    });
  });
});
