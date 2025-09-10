const { sequelize } = require('./src/config/database');
const bcrypt = require('bcryptjs');

const fixPasswords = async () => {
  try {
    console.log('🔧 Fixing user passwords...');

    // Generate correct hash for password123
    const correctHash = await bcrypt.hash('password123', 12);
    console.log('Generated correct hash for password123');

    // Update all users that should use password123
    const usersToUpdate = [
      'ict.coordinator@ictu.edu.cm',
      'bms.coordinator@ictu.edu.cm',
      'cs.head@ictu.edu.cm',
      'it.head@ictu.edu.cm',
      'mgmt.head@ictu.edu.cm',
      'marketing.head@ictu.edu.cm',
      'student.james@ictu.edu.cm',
      'student.maria@ictu.edu.cm',
      'student.ahmed@ictu.edu.cm',
      'student.priya@ictu.edu.cm',
      'student.omar@ictu.edu.cm',
      'student.lulu@ictu.edu.cm',
      'bms.student1@ictu.edu.cm',
      'bms.student2@ictu.edu.cm',
      'prof.davis@ictu.edu.cm',
      'dr.sarah.j@ictu.edu.cm',
      'lecturer.mark@ictu.edu.cm',
      'lecturer.emily@ictu.edu.cm',
      'registrar@ictu.edu.cm',
      'it.support@ictu.edu.cm',
      'library@ictu.edu.cm'
    ];

    for (const email of usersToUpdate) {
      const result = await sequelize.query(
        'UPDATE users SET password = :password WHERE email = :email',
        {
          replacements: { password: correctHash, email },
          type: sequelize.QueryTypes.UPDATE
        }
      );
      console.log(`✅ Updated password for: ${email} (${result[0]} rows affected)`);
    }

    console.log('🎉 Passwords fixed successfully!');
    console.log('📝 All users can now login with: password123');

  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
  } finally {
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  fixPasswords();
}

module.exports = { fixPasswords };
