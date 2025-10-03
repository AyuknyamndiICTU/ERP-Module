const axios = require('axios');

async function testRegistration() {
  try {
    console.log('Testing student registration...');
    
    const testData = {
      firstName: 'Test',
      lastName: 'Student',
      email: 'test.student' + Date.now() + '@example.com',
      dateOfBirth: '2000-01-01',
      gender: 'Male',
      age: 24,
      bloodGroup: 'O+',
      regionOfOrigin: 'Northwest',
      placeOfOrigin: 'Bamenda',
      address: {
        street: '123 Test Street',
        city: 'Bamenda',
        region: 'Northwest',
        country: 'Cameroon'
      },
      phoneNumber: '123456789',
      facultyId: '11111111-1111-1111-1111-111111111111', // ICT Faculty
      departmentId: '44444444-4444-4444-4444-444444444444', // Information Technology
      majorId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', // Bachelor of Information Technology
      semester: 1,
      level: 'undergraduate',
      studentType: 'regular',
      selectedCourses: ['IT101', 'IT102'],
      emergencyContact: {
        name: 'John Doe',
        relationship: 'Parent',
        phoneNumber: '987654321',
        email: 'john.doe@example.com'
      }
    };
    
    const response = await axios.post('http://localhost:3001/api/public/register', testData);
    
    console.log('Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('Registration failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Full error:', error.message);
  }
}

testRegistration();
