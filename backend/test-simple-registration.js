const axios = require('axios');

async function testSimpleRegistration() {
  try {
    console.log('Testing simple student registration...');
    
    const testData = {
      firstName: 'Simple',
      lastName: 'Test',
      email: 'simple.test' + Date.now() + '@example.com',
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
    
    console.log('Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('Registration failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

testSimpleRegistration();
