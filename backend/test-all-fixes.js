const axios = require('axios');

async function testAllFixes() {
  console.log('🔧 TESTING ALL CONFLICT FIXES...\n');
  
  let testsPassed = 0;
  let totalTests = 0;
  
  // Test 1: Logger imports
  console.log('1️⃣ Testing Logger Imports...');
  totalTests++;
  try {
    const logger = require('./src/utils/logger');
    const emailService = require('./src/utils/emailService');
    const rateLimiter = require('./src/middleware/rateLimiter');
    logger.info('Logger imports test successful');
    console.log('✅ Logger imports working correctly\n');
    testsPassed++;
  } catch (error) {
    console.log('❌ Logger imports failed:', error.message, '\n');
  }
  
  // Test 2: Public Registration API
  console.log('2️⃣ Testing Public Registration API...');
  totalTests++;
  try {
    const testData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test.fixes' + Date.now() + '@example.com',
      dateOfBirth: '2000-01-01',
      gender: 'Male',
      regionOfOrigin: 'Northwest',
      placeOfOrigin: 'Bamenda',
      phoneNumber: '123456789',
      facultyId: '11111111-1111-1111-1111-111111111111',
      departmentId: '44444444-4444-4444-4444-444444444444',
      majorId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      semester: 1,
      level: 'undergraduate',
      emergencyContact: {
        name: 'John Doe',
        relationship: 'Parent',
        phoneNumber: '987654321'
      }
    };
    
    const response = await axios.post('http://localhost:3001/api/public/register', testData);
    console.log('✅ Registration successful:', response.data.student.matricule, '\n');
    testsPassed++;
  } catch (error) {
    console.log('❌ Registration failed:', error.response?.data?.message || error.message, '\n');
  }
  
  // Test 3: Public Courses API
  console.log('3️⃣ Testing Public Courses API...');
  totalTests++;
  try {
    const response = await axios.get('http://localhost:3001/api/public/courses', {
      params: { departmentId: '44444444-4444-4444-4444-444444444444', semester: 1 }
    });
    console.log('✅ Courses API working:', response.data.courses.length, 'courses found\n');
    testsPassed++;
  } catch (error) {
    console.log('❌ Courses API failed:', error.response?.data?.message || error.message, '\n');
  }
  
  // Test 4: Authentication API
  console.log('4️⃣ Testing Authentication API...');
  totalTests++;
  try {
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@ictu.edu.cm',
      password: 'admin123'
    });
    console.log('✅ Authentication working: Token received\n');
    testsPassed++;
  } catch (error) {
    console.log('❌ Authentication failed:', error.response?.data?.message || error.message, '\n');
  }
  
  // Test 5: Database Connection
  console.log('5️⃣ Testing Database Connection...');
  totalTests++;
  try {
    const { sequelize } = require('./src/config/database');
    await sequelize.authenticate();
    console.log('✅ Database connection working\n');
    testsPassed++;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message, '\n');
  }
  
  // Summary
  console.log('📊 TEST SUMMARY:');
  console.log(`✅ Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`❌ Tests Failed: ${totalTests - testsPassed}/${totalTests}`);
  console.log(`🎯 Success Rate: ${Math.round((testsPassed / totalTests) * 100)}%\n`);
  
  if (testsPassed === totalTests) {
    console.log('🎉 ALL FIXES WORKING CORRECTLY! System is ready for use.');
  } else {
    console.log('⚠️  Some issues remain. Please check the failed tests above.');
  }
}

testAllFixes().catch(console.error);
