const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = 'password123';
  const hash = '$2b$12$LQv3c1yqBw2uuCD5M/hS.OdHXBpDdHOoqDMVVJvbdLdoUBqhqreQG';
  
  try {
    const isValid = await bcrypt.compare(password, hash);
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('Password matches:', isValid);
    
    if (!isValid) {
      // Let's try to create a new hash for the password to see what it should be
      const newHash = await bcrypt.hash(password, 12);
      console.log('New hash for same password:', newHash);
      
      // Test the new hash
      const newHashValid = await bcrypt.compare(password, newHash);
      console.log('New hash matches:', newHashValid);
    }
  } catch (error) {
    console.error('Error testing password:', error);
  }
}

testPassword();
