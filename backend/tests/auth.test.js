const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/auth');
const { sequelize } = require('../src/config/database');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Test data
const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'Admin@123'
  },
  student: {
    email: 'student@test.com', 
    password: 'Student@123'
  },
  newUser: {
    email: 'newuser@test.com',
    password: 'NewUser@123',
    firstName: 'New',
    lastName: 'User',
    role: 'student'
  }
};

describe('Authentication System', () => {
  let authToken;

  describe('POST /api/auth/login', () => {
    it('should login with valid admin credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send(testUsers.admin);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUsers.admin.email);
      
      authToken = res.body.token;
    });

    it('should login with valid student credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send(testUsers.student);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.role).toBe('student');
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers.admin.email,
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should not login with non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password'
        });
      
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUsers.newUser);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUsers.newUser.email);
    });

    it('should not register with existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUsers.admin);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'incomplete@test.com'
        });
      
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('Token validation', () => {
    it('should validate JWT token format', () => {
      expect(authToken).toBeDefined();
      expect(typeof authToken).toBe('string');
      expect(authToken.split('.')).toHaveLength(3);
    });
  });
});
