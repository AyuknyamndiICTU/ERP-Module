const { sequelize } = require('./src/config/database');

async function createSampleNotifications() {
  try {
    console.log('🔔 Creating sample notifications...\n');
    
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
    
    const adminUser = users.find(u => u.role === 'admin');
    const studentUser = users.find(u => u.role === 'student');
    const lecturerUser = users.find(u => u.role === 'lecturer');
    
    // Sample notifications data
    const notifications = [
      {
        recipient_id: studentUser?.id || users[0].id,
        sender_id: adminUser?.id || users[0].id,
        title: 'Welcome to ICTU ERP System',
        message: 'Your account has been successfully activated. You can now access all system features including course registration, grades, and more.',
        type: 'success',
        category: 'system',
        is_read: false,
        is_popup: true,
        popup_shown: false,
        priority: 'medium'
      },
      {
        recipient_id: studentUser?.id || users[0].id,
        sender_id: lecturerUser?.id || adminUser?.id || users[0].id,
        title: 'Course Registration Open',
        message: 'Course registration for the new semester is now open. Please register before the deadline to secure your spot in desired courses.',
        type: 'info',
        category: 'academic',
        is_read: false,
        is_popup: false,
        priority: 'high'
      },
      {
        recipient_id: studentUser?.id || users[0].id,
        sender_id: adminUser?.id || users[0].id,
        title: 'Fee Payment Reminder',
        message: 'Your tuition fee payment is due in 3 days. Please make payment to avoid account suspension. Visit the finance office for assistance.',
        type: 'warning',
        category: 'finance',
        is_read: false,
        is_popup: true,
        popup_shown: false,
        priority: 'high'
      },
      {
        recipient_id: lecturerUser?.id || users[0].id,
        sender_id: adminUser?.id || users[0].id,
        title: 'Grade Submission Deadline',
        message: 'Please submit all grades for the current semester by Friday. Late submissions may affect student graduation timelines.',
        type: 'warning',
        category: 'academic',
        is_read: true,
        is_popup: false,
        priority: 'high'
      },
      {
        recipient_id: adminUser?.id || users[0].id,
        sender_id: studentUser?.id || users[0].id,
        title: 'New Student Complaint',
        message: 'A new complaint has been submitted regarding course scheduling conflicts. Please review and respond promptly.',
        type: 'info',
        category: 'complaint',
        is_read: false,
        is_popup: true,
        popup_shown: false,
        priority: 'medium'
      }
    ];
    
    // Insert notifications
    for (const notification of notifications) {
      await sequelize.query(`
        INSERT INTO notifications (
          id, recipient_id, sender_id, title, message, type, category,
          is_read, is_popup, popup_shown, priority, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), :recipient_id, :sender_id, :title, :message, :type, :category,
          :is_read, :is_popup, :popup_shown, :priority, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `, {
        replacements: notification,
        type: sequelize.QueryTypes.INSERT
      });
      
      console.log(`✅ Created notification: ${notification.title}`);
    }
    
    // Check total notifications created
    const [result] = await sequelize.query(
      'SELECT COUNT(*) as count FROM notifications',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`\n🎉 Sample notifications created successfully!`);
    console.log(`📊 Total notifications in database: ${result.count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample notifications:', error);
    process.exit(1);
  }
}

createSampleNotifications();
