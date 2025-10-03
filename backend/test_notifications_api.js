const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test user credentials
const testUser = {
  email: 'student@ictu.edu.cm',
  password: 'student123'
};

async function testNotificationsAPI() {
  try {
    console.log('🔔 Testing Notifications API...\n');
    
    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.error);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Set up axios with auth header
    const authAxios = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Step 2: Get notifications
    console.log('\n2. Fetching notifications...');
    const notificationsResponse = await authAxios.get('/notifications');
    
    console.log('✅ Notifications fetched successfully');
    console.log(`📊 Total notifications: ${notificationsResponse.data.totalCount}`);
    console.log(`📬 Unread notifications: ${notificationsResponse.data.unreadCount}`);
    
    if (notificationsResponse.data.notifications.length > 0) {
      console.log('\n📝 Sample notifications:');
      notificationsResponse.data.notifications.slice(0, 3).forEach((notif, index) => {
        console.log(`  ${index + 1}. ${notif.title} (${notif.type}) - Read: ${notif.isRead}`);
      });
      
      // Step 3: Test mark as read
      const firstUnreadNotification = notificationsResponse.data.notifications.find(n => !n.isRead);
      if (firstUnreadNotification) {
        console.log(`\n3. Marking notification as read: ${firstUnreadNotification.title}`);
        const markReadResponse = await authAxios.put(`/notifications/${firstUnreadNotification.id}/read`);
        console.log('✅ Notification marked as read');
        
        // Step 4: Test delete notification
        console.log(`\n4. Deleting notification: ${firstUnreadNotification.title}`);
        const deleteResponse = await authAxios.delete(`/notifications/${firstUnreadNotification.id}`);
        console.log('✅ Notification deleted successfully');
      }
      
      // Step 5: Test mark all as read
      console.log('\n5. Marking all notifications as read...');
      const markAllReadResponse = await authAxios.put('/notifications/read-all');
      console.log(`✅ ${markAllReadResponse.data.updated} notifications marked as read`);
    }
    
    console.log('\n🎉 All notification API tests passed!');
    
  } catch (error) {
    console.error('❌ Error testing notifications API:', error.response?.data || error.message);
  }
}

testNotificationsAPI();
