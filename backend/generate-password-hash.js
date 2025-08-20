const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'password123';
  
  try {
    // Generate a new hash for password123
    const hash = await bcrypt.hash(password, 12);
    console.log('Password:', password);
    console.log('Generated hash:', hash);
    
    // Verify the hash works
    const isValid = await bcrypt.compare(password, hash);
    console.log('Hash verification:', isValid);
    
    // Test the old hash from the database
    const oldHash = '$2b$12$LQv3c1yqBw2uuCD5M/hS.OdHXBpDdHOoqDMVVJvbdLdoUBqhqreQG';
    const oldHashValid = await bcrypt.compare(password, oldHash);
    console.log('Old hash verification:', oldHashValid);
    
    // Try some common passwords with the old hash
    const commonPasswords = ['admin', 'admin123', 'password', 'test123', 'erp123'];
    
    for (const pwd of commonPasswords) {
      const matches = await bcrypt.compare(pwd, oldHash);
      if (matches) {
        console.log(`Old hash matches password: "${pwd}"`);
        break;
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

generateHash();
