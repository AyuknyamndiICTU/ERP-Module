const axios = require('axios');

// Test user credentials from the database
const testUsers = [
  { email: 'admin@ictu.edu.cm', password: 'admin123', role: 'admin' },
  { email: 'faculty.coordinator@ictu.edu.cm', password: 'coord123', role: 'faculty_coordinator' },
  { email: 'lecturer@ictu.edu.cm', password: 'lecturer123', role: 'lecturer' },
  { email: 'hr.staff@ictu.edu.cm', password: 'hr123', role: 'hr_staff' },
  { email: 'finance.staff@ictu.edu.cm', password: 'finance123', role: 'finance_staff' },
  { email: 'student@ictu.edu.cm', password: 'student123', role: 'student' }
];

const API_BASE_URL = 'http://localhost:3001/api';

async function testLogin(user) {
  try {
    console.log(`\n🔐 Testing login for ${user.role}: ${user.email}`);
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: user.email,
      password: user.password
    });

    if (response.data.success) {
      const { user: userData, token } = response.data;
      console.log(`✅ Login successful for ${user.role}`);
      console.log(`   User: ${userData.firstName} ${userData.lastName}`);
      console.log(`   Role: ${userData.role}`);
      console.log(`   Token: ${token.substring(0, 20)}...`);
      return { success: true, user: userData, token };
    } else {
      console.log(`❌ Login failed for ${user.role}: ${response.data.error}`);
      return { success: false, error: response.data.error };
    }
  } catch (error) {
    console.log(`❌ Login error for ${user.role}: ${error.response?.data?.error || error.message}`);
    return { success: false, error: error.response?.data?.error || error.message };
  }
}

async function testAllLogins() {
  console.log('🚀 Testing Frontend-Backend Authentication Integration');
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const user of testUsers) {
    const result = await testLogin(user);
    results.push({ ...user, ...result });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n📊 AUTHENTICATION TEST SUMMARY');
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful logins: ${successful.length}/${results.length}`);
  console.log(`❌ Failed logins: ${failed.length}/${results.length}`);
  
  if (failed.length > 0) {
    console.log('\n❌ Failed login details:');
    failed.forEach(user => {
      console.log(`   - ${user.role} (${user.email}): ${user.error}`);
    });
  }
  
  if (successful.length === results.length) {
    console.log('\n🎉 ALL AUTHENTICATION TESTS PASSED!');
    console.log('Frontend-backend integration is working correctly.');
  } else {
    console.log('\n⚠️  Some authentication tests failed. Please check the issues above.');
  }
  
  return {
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    results
  };
}

// Run the tests
testAllLogins().catch(console.error);
