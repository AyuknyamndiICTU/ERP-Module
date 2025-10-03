const axios = require('axios');

async function testCoursesAPI() {
  try {
    console.log('Testing courses API...');
    
    // First, try to login to get a valid token
    try {
      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'admin@ictu.edu.cm',
        password: 'admin123'
      });
      
      const token = loginResponse.data.token;
      console.log('Login successful, got token');
      
      // Test courses API with authentication
      const coursesResponse = await axios.get('http://localhost:3001/api/academic/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          departmentId: '44444444-4444-4444-4444-444444444444',
          semester: 1,
          status: 'active'
        }
      });
      
      console.log('Courses API Response:');
      console.log('Success:', coursesResponse.data.success);
      console.log('Total courses:', coursesResponse.data.data.length);
      console.log('First few courses:', coursesResponse.data.data.slice(0, 3).map(c => ({
        code: c.courseCode,
        name: c.courseName,
        department: c.department,
        semester: c.semester
      })));
      
    } catch (loginError) {
      console.log('Login failed, testing without authentication...');
      console.log('Login error:', loginError.response?.data || loginError.message);
      
      // Test without authentication to see the error
      try {
        await axios.get('http://localhost:3001/api/academic/courses?departmentId=44444444-4444-4444-4444-444444444444&semester=1&status=active');
      } catch (authError) {
        console.log('Expected auth error:', authError.response?.data);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testCoursesAPI();
