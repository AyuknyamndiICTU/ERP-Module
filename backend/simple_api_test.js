const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testAPIEndpoints() {
  console.log('🚀 Testing API Endpoints...\n');
  
  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log(`✅ Health Check: ${healthResponse.status} - ${healthResponse.data.message}\n`);
    
    // Test 2: Authentication with existing user
    console.log('2. Testing Authentication...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@erp.local',
        password: 'password123'
      });
      console.log(`✅ Login: ${loginResponse.status} - Token received: ${!!loginResponse.data.token}`);
      
      const token = loginResponse.data.token;
      
      // Test 3: Protected endpoint with token
      console.log('\n3. Testing Protected Endpoints...');
      
      // Test Students endpoint
      try {
        const studentsResponse = await axios.get(`${API_BASE_URL}/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Students: ${studentsResponse.status} - Found ${studentsResponse.data.students?.length || 0} students`);
      } catch (error) {
        console.log(`❌ Students: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
      
      // Test Courses endpoint
      try {
        const coursesResponse = await axios.get(`${API_BASE_URL}/academic/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Courses: ${coursesResponse.status} - Found ${coursesResponse.data.courses?.length || 0} courses`);
      } catch (error) {
        console.log(`❌ Courses: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
      
      // Test HR Employees endpoint
      try {
        const employeesResponse = await axios.get(`${API_BASE_URL}/hr/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Employees: ${employeesResponse.status} - Found ${employeesResponse.data.employees?.length || 0} employees`);
      } catch (error) {
        console.log(`❌ Employees: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
      
      // Test Finance Invoices endpoint
      try {
        const invoicesResponse = await axios.get(`${API_BASE_URL}/finance/invoices`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Invoices: ${invoicesResponse.status} - Found ${invoicesResponse.data.invoices?.length || 0} invoices`);
      } catch (error) {
        console.log(`❌ Invoices: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
      
      // Test CRUD Operations
      console.log('\n4. Testing CRUD Operations...');
      
      // Create a new course
      try {
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
        
        const createResponse = await axios.post(`${API_BASE_URL}/academic/courses`, newCourse, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Create Course: ${createResponse.status} - Course created with ID ${createResponse.data.course?.id}`);
        
        const courseId = createResponse.data.course?.id;
        if (courseId) {
          // Update the course
          const updateData = { description: 'Updated test course description' };
          const updateResponse = await axios.put(`${API_BASE_URL}/academic/courses/${courseId}`, updateData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log(`✅ Update Course: ${updateResponse.status} - Course updated`);
          
          // Delete the course
          const deleteResponse = await axios.delete(`${API_BASE_URL}/academic/courses/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log(`✅ Delete Course: ${deleteResponse.status} - Course deleted`);
        }
        
      } catch (error) {
        console.log(`❌ CRUD Operations: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
      
    } catch (authError) {
      console.log(`❌ Authentication failed: ${authError.response?.status} - ${authError.response?.data?.message || authError.message}`);
      
      // Try with different credentials
      console.log('\n   Trying alternative authentication...');
      try {
        const altLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'admin@ictu.edu.cm',
          password: 'password123'
        });
        console.log(`✅ Alternative Login: ${altLoginResponse.status} - Token received`);
      } catch (altError) {
        console.log(`❌ Alternative Login: ${altError.response?.status} - ${altError.response?.data?.message || altError.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n🎉 API Testing Complete!');
}

testAPIEndpoints();
