const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test user credentials
const testUser = {
  email: 'student@ictu.edu.cm',
  password: 'student123'
};

async function debugAuth() {
  try {
    console.log('🔍 Debugging Authentication...\n');
    
    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
    
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.error);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');
    
    // Step 2: Test protected route with token
    console.log('\n2. Testing protected route...');
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Profile request successful');
      console.log('User data:', JSON.stringify(profileResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Profile request failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugAuth();
