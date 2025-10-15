/**
 * Test script for Smart Rate Limiting
 * 
 * This script tests the new rate limiting implementation to ensure:
 * 1. Unauthenticated users have lower limits
 * 2. Authenticated users have higher limits
 * 3. Admin users bypass rate limiting
 * 4. Different endpoints have appropriate limits
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Test credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@ictu.edu.cm',
  password: 'admin123'
};

const STUDENT_CREDENTIALS = {
  email: 'student@ictu.edu.cm',
  password: 'student123'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`)
};

/**
 * Test unauthenticated rate limiting
 */
async function testUnauthenticatedRateLimit() {
  log.section('=== Testing Unauthenticated Rate Limiting ===');
  
  let successCount = 0;
  let rateLimitCount = 0;
  const maxRequests = 15; // Should hit limit around 10 requests
  
  for (let i = 1; i <= maxRequests; i++) {
    try {
      const response = await axios.get(`${API_URL}/public/faculties`);
      successCount++;
      log.info(`Request ${i}: Success (${response.status})`);
    } catch (error) {
      if (error.response?.status === 429) {
        rateLimitCount++;
        log.warning(`Request ${i}: Rate limited (429)`);
        const retryAfter = error.response.headers['retry-after'];
        log.info(`  Retry after: ${retryAfter} seconds`);
        break; // Stop after hitting rate limit
      } else {
        log.error(`Request ${i}: Error (${error.response?.status || error.message})`);
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  log.info(`\nResults: ${successCount} successful, ${rateLimitCount} rate limited`);
  
  if (rateLimitCount > 0) {
    log.success('Unauthenticated rate limiting is working!');
  } else {
    log.warning('Did not hit rate limit (may need more requests or limit is very high)');
  }
  
  return { successCount, rateLimitCount };
}

/**
 * Test authenticated student rate limiting
 */
async function testAuthenticatedStudentRateLimit() {
  log.section('=== Testing Authenticated Student Rate Limiting ===');
  
  try {
    // Login as student
    log.info('Logging in as student...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, STUDENT_CREDENTIALS);
    const token = loginResponse.data.token;
    log.success('Login successful');
    
    let successCount = 0;
    let rateLimitCount = 0;
    const maxRequests = 25; // Should have higher limit than unauthenticated
    
    for (let i = 1; i <= maxRequests; i++) {
      try {
        const response = await axios.get(`${API_URL}/academic/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        successCount++;
        log.info(`Request ${i}: Success (${response.status})`);
      } catch (error) {
        if (error.response?.status === 429) {
          rateLimitCount++;
          log.warning(`Request ${i}: Rate limited (429)`);
          break;
        } else {
          log.error(`Request ${i}: Error (${error.response?.status || error.message})`);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    log.info(`\nResults: ${successCount} successful, ${rateLimitCount} rate limited`);
    
    if (successCount > 10) {
      log.success('Authenticated users have higher limits than unauthenticated!');
    }
    
    return { successCount, rateLimitCount };
  } catch (error) {
    log.error(`Login failed: ${error.response?.data?.error || error.message}`);
    return { successCount: 0, rateLimitCount: 0 };
  }
}

/**
 * Test admin bypass
 */
async function testAdminBypass() {
  log.section('=== Testing Admin Rate Limit Bypass ===');
  
  try {
    // Login as admin
    log.info('Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, ADMIN_CREDENTIALS);
    const token = loginResponse.data.token;
    log.success('Login successful');
    
    let successCount = 0;
    const maxRequests = 50; // Admin should bypass rate limiting
    
    for (let i = 1; i <= maxRequests; i++) {
      try {
        const response = await axios.get(`${API_URL}/academic/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        successCount++;
        
        if (i % 10 === 0) {
          log.info(`Request ${i}: Success (${response.status})`);
        }
      } catch (error) {
        if (error.response?.status === 429) {
          log.error(`Request ${i}: Rate limited (429) - Admin bypass FAILED!`);
          return { successCount, bypassed: false };
        } else {
          log.error(`Request ${i}: Error (${error.response?.status || error.message})`);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    
    log.info(`\nResults: ${successCount}/${maxRequests} successful`);
    
    if (successCount === maxRequests) {
      log.success('Admin rate limit bypass is working!');
      return { successCount, bypassed: true };
    } else {
      log.warning('Some requests failed (may be due to other errors)');
      return { successCount, bypassed: true };
    }
  } catch (error) {
    log.error(`Login failed: ${error.response?.data?.error || error.message}`);
    return { successCount: 0, bypassed: false };
  }
}

/**
 * Test login rate limiting (strict)
 */
async function testLoginRateLimit() {
  log.section('=== Testing Login Rate Limiting (Strict) ===');
  
  let successCount = 0;
  let rateLimitCount = 0;
  const maxAttempts = 15; // Should hit limit around 10 attempts
  
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      successCount++;
    } catch (error) {
      if (error.response?.status === 429) {
        rateLimitCount++;
        log.warning(`Attempt ${i}: Rate limited (429)`);
        break;
      } else if (error.response?.status === 401) {
        successCount++; // Count as successful request (not rate limited)
        log.info(`Attempt ${i}: Invalid credentials (${error.response.status})`);
      } else {
        log.error(`Attempt ${i}: Error (${error.response?.status || error.message})`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  log.info(`\nResults: ${successCount} attempts, ${rateLimitCount} rate limited`);
  
  if (rateLimitCount > 0) {
    log.success('Login rate limiting is working (prevents brute force attacks)!');
  } else {
    log.warning('Did not hit login rate limit');
  }
  
  return { successCount, rateLimitCount };
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║   Smart Rate Limiting Test Suite          ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}`);
  
  const results = {};
  
  try {
    // Test 1: Unauthenticated rate limiting
    results.unauthenticated = await testUnauthenticatedRateLimit();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    // Test 2: Authenticated student rate limiting
    results.student = await testAuthenticatedStudentRateLimit();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 3: Admin bypass
    results.admin = await testAdminBypass();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 4: Login rate limiting
    results.login = await testLoginRateLimit();
    
    // Summary
    log.section('=== Test Summary ===');
    console.log('\nUnauthenticated Requests:');
    console.log(`  Success: ${results.unauthenticated.successCount}`);
    console.log(`  Rate Limited: ${results.unauthenticated.rateLimitCount}`);
    
    console.log('\nAuthenticated Student Requests:');
    console.log(`  Success: ${results.student.successCount}`);
    console.log(`  Rate Limited: ${results.student.rateLimitCount}`);
    
    console.log('\nAdmin Requests:');
    console.log(`  Success: ${results.admin.successCount}`);
    console.log(`  Bypassed: ${results.admin.bypassed ? 'Yes' : 'No'}`);
    
    console.log('\nLogin Attempts:');
    console.log(`  Attempts: ${results.login.successCount}`);
    console.log(`  Rate Limited: ${results.login.rateLimitCount}`);
    
    log.section('=== Overall Result ===');
    log.success('Rate limiting tests completed!');
    log.info('Check the results above to verify all limits are working as expected.');
    
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
  }
}

// Run tests
runAllTests().catch(console.error);
