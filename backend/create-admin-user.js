const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');
const { logger } = require('./src/utils/logger');

const createAdminUser = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync models
    await sequelize.sync({ force: false });
    console.log('✅ Database models synchronized');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      where: { email: 'admin@ictu.edu.cm' } 
    });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('📧 Email: admin@ictu.edu.cm');
      console.log('🔑 Password: admin123');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await User.create({
      email: 'admin@ictu.edu.cm',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'system_admin',
      isActive: true
    });

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email: admin@ictu.edu.cm');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: System Administrator');

    // Create faculty coordinator
    const facultyCoordPassword = await bcrypt.hash('faculty123', 12);
    const facultyCoord = await User.create({
      email: 'faculty@ictu.edu.cm',
      password: facultyCoordPassword,
      firstName: 'Faculty',
      lastName: 'Coordinator',
      role: 'faculty_coordinator',
      coordinatorType: 'faculty',
      isActive: true
    });

    console.log('👥 Faculty Coordinator created:');
    console.log('📧 Email: faculty@ictu.edu.cm');
    console.log('🔑 Password: faculty123');

    // Create student user
    const studentPassword = await bcrypt.hash('student123', 12);
    const student = await User.create({
      email: 'student@ictu.edu.cm',
      password: studentPassword,
      firstName: 'Test',
      lastName: 'Student',
      role: 'student',
      isActive: true
    });

    console.log('🎓 Test Student created:');
    console.log('📧 Email: student@ictu.edu.cm');
    console.log('🔑 Password: student123');

    // Create finance staff
    const financePassword = await bcrypt.hash('finance123', 12);
    const finance = await User.create({
      email: 'finance@ictu.edu.cm',
      password: financePassword,
      firstName: 'Finance',
      lastName: 'Staff',
      role: 'finance_staff',
      isActive: true
    });

    console.log('💰 Finance Staff created:');
    console.log('📧 Email: finance@ictu.edu.cm');
    console.log('🔑 Password: finance123');

    console.log('\n🚀 All users created successfully! You can now login to the system.');

  } catch (error) {
    console.error('❌ Error creating users:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run the script
createAdminUser();
