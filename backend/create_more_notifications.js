const { sequelize } = require('./src/config/database');

async function createMoreNotifications() {
  try {
    console.log('🔔 Creating additional notifications...\n');
    
    // Get user IDs for different roles
    const users = await sequelize.query(
      'SELECT id, email, role FROM users WHERE email IN (:emails)',
      {
        replacements: { 
          emails: ['admin@ictu.edu.cm', 'student@ictu.edu.cm', 'lecturer@ictu.edu.cm', 'hr.staff@ictu.edu.cm', 'finance.staff@ictu.edu.cm']
        },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (users.length === 0) {
      console.log('❌ No users found to create notifications for');
      return;
    }
    
    const studentUser = users.find(u => u.role === 'student');
    const lecturerUser = users.find(u => u.role === 'lecturer');
    
    // Additional notifications using correct column names
    const notifications = [
      {
        user_id: studentUser?.id || users[0].id,
        title: 'Course Registration Reminder',
        message: 'Course registration for the new semester closes in 2 days. Please complete your registration to secure your courses.',
        type: 'warning',
        is_read: false,
        metadata: JSON.stringify({ category: 'academic', priority: 'high' })
      },
      {
        user_id: studentUser?.id || users[0].id,
        title: 'Assignment Due Soon',
        message: 'Your Computer Science assignment is due tomorrow at 11:59 PM. Make sure to submit it on time.',
        type: 'warning',
        is_read: false,
        metadata: JSON.stringify({ category: 'academic', priority: 'high' })
      },
      {
        user_id: lecturerUser?.id || users[0].id,
        title: 'Grade Submission Required',
        message: 'Please submit grades for your courses by the end of this week. Students are waiting for their results.',
        type: 'info',
        is_read: false,
        metadata: JSON.stringify({ category: 'academic', priority: 'medium' })
      },
      {
        user_id: studentUser?.id || users[0].id,
        title: 'Fee Payment Confirmation',
        message: 'Your tuition fee payment has been received and processed successfully. Thank you for your payment.',
        type: 'success',
        is_read: true,
        metadata: JSON.stringify({ category: 'finance', priority: 'low' })
      }
    ];
    
    // Insert notifications
    for (const notification of notifications) {
      await sequelize.query(`
        INSERT INTO notifications (
          id, user_id, title, message, type, is_read, metadata, created_at
        ) VALUES (
          gen_random_uuid(), :user_id, :title, :message, :type, :is_read, :metadata, CURRENT_TIMESTAMP
        )
      `, {
        replacements: notification,
        type: sequelize.QueryTypes.INSERT
      });
      
      console.log(`✅ Created notification: ${notification.title}`);
    }
    
    // Check total notifications
    const [result] = await sequelize.query(
      'SELECT COUNT(*) as count FROM notifications',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`\n🎉 Additional notifications created successfully!`);
    console.log(`📊 Total notifications in database: ${result.count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating notifications:', error);
    process.exit(1);
  }
}

createMoreNotifications();
