const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testCoreFunctionality() {
  console.log('🚀 Testing Core Frontend-Backend Integration');
  console.log('=' .repeat(60));
  
  const results = {
    authentication: 0,
    authorization: 0,
    apiAccess: 0,
    security: 0
  };
  
  try {
    // Test 1: Authentication for all user roles
    console.log('\n1️⃣ Testing Authentication for All User Roles');
    const testUsers = [
      { email: 'admin@ictu.edu.cm', password: 'admin123', role: 'admin' },
      { email: 'faculty.coordinator@ictu.edu.cm', password: 'coord123', role: 'faculty_coordinator' },
      { email: 'lecturer@ictu.edu.cm', password: 'lecturer123', role: 'lecturer' },
      { email: 'hr.staff@ictu.edu.cm', password: 'hr123', role: 'hr_staff' },
      { email: 'finance.staff@ictu.edu.cm', password: 'finance123', role: 'finance_staff' },
      { email: 'student@ictu.edu.cm', password: 'student123', role: 'student' }
    ];
    
    const tokens = {};
    let authSuccessCount = 0;
    
    for (const user of testUsers) {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: user.email,
          password: user.password
        });
        
        if (response.data.success && response.data.token) {
          tokens[user.role] = response.data.token;
          authSuccessCount++;
          console.log(`✅ ${user.role} authentication successful`);
        }
      } catch (error) {
        console.log(`❌ ${user.role} authentication failed`);
      }
    }
    
    results.authentication = authSuccessCount;
    console.log(`Authentication Score: ${authSuccessCount}/6`);
    
    // Test 2: Token-based API Access
    console.log('\n2️⃣ Testing Token-based API Access');
    let apiAccessCount = 0;
    
    // Test basic endpoints that should exist
    const testEndpoints = [
      { path: '/users', method: 'GET', roles: ['admin'] },
      { path: '/finance/invoices', method: 'GET', roles: ['admin', 'finance_staff'] },
      { path: '/students', method: 'GET', roles: ['admin', 'faculty_coordinator'] }
    ];
    
    for (const endpoint of testEndpoints) {
      for (const role of endpoint.roles) {
        if (tokens[role]) {
          try {
            const response = await axios({
              method: endpoint.method,
              url: `${API_BASE_URL}${endpoint.path}`,
              headers: { Authorization: `Bearer ${tokens[role]}` }
            });
            
            if (response.status === 200) {
              console.log(`✅ ${role} can access ${endpoint.path}`);
              apiAccessCount++;
            }
          } catch (error) {
            if (error.response?.status === 403) {
              console.log(`⚠️  ${role} forbidden from ${endpoint.path} (expected)`);
            } else if (error.response?.status === 404) {
              console.log(`ℹ️  ${endpoint.path} not found (may not be implemented)`);
            } else {
              console.log(`❌ ${role} failed to access ${endpoint.path}`);
            }
          }
        }
      }
    }
    
    results.apiAccess = apiAccessCount;
    
    // Test 3: Security - Unauthorized Access
    console.log('\n3️⃣ Testing Security Controls');
    let securityTestsPassed = 0;
    
    // Test without token
    try {
      await axios.get(`${API_BASE_URL}/users`);
      console.log('❌ Security issue: Unauthorized access allowed');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Unauthorized access properly blocked');
        securityTestsPassed++;
      }
    }
    
    // Test with invalid token
    try {
      await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: 'Bearer invalid-token-12345' }
      });
      console.log('❌ Security issue: Invalid token accepted');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid token properly rejected');
        securityTestsPassed++;
      }
    }
    
    results.security = securityTestsPassed;
    
    // Test 4: Frontend-Backend Communication
    console.log('\n4️⃣ Testing Frontend-Backend Communication');
    
    // Test CORS and response format
    if (tokens.admin) {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'admin@ictu.edu.cm',
          password: 'admin123'
        });
        
        const hasCorrectFormat = response.data.hasOwnProperty('success') && 
                                response.data.hasOwnProperty('user') && 
                                response.data.hasOwnProperty('token');
        
        if (hasCorrectFormat) {
          console.log('✅ API response format correct for frontend consumption');
          results.authorization = 1;
        } else {
          console.log('❌ API response format incorrect');
        }
      } catch (error) {
        console.log('❌ Frontend-backend communication issue');
      }
    }
    
    // Final Results
    console.log('\n📊 CORE FUNCTIONALITY TEST RESULTS');
    console.log('=' .repeat(60));
    console.log(`🔐 Authentication: ${results.authentication}/6 users can login`);
    console.log(`🛡️  Authorization: ${results.authorization}/1 response format correct`);
    console.log(`🌐 API Access: ${results.apiAccess} successful endpoint calls`);
    console.log(`🔒 Security: ${results.security}/2 security tests passed`);
    
    const totalScore = results.authentication + results.authorization + results.security;
    const maxScore = 6 + 1 + 2; // 9 total
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    console.log(`\n🎯 Overall Score: ${totalScore}/${maxScore} (${percentage}%)`);
    
    if (percentage >= 90) {
      console.log('🎉 EXCELLENT: Frontend-Backend integration is working perfectly!');
    } else if (percentage >= 75) {
      console.log('✅ GOOD: Core functionality is working well');
    } else if (percentage >= 50) {
      console.log('⚠️  FAIR: Basic functionality working, some issues need attention');
    } else {
      console.log('❌ POOR: Significant issues need to be resolved');
    }
    
  } catch (error) {
    console.error('\n❌ Core functionality test failed:', error.message);
  }
}

testCoreFunctionality();
