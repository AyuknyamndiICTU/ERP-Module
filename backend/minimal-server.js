const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Server is running'
  });
});

// Test login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password });
    
    // Test credentials
    const testUsers = {
      'admin@erp.local': { role: 'admin', name: 'System Administrator' },
      'john.professor@erp.local': { role: 'academic_staff', name: 'John Professor' },
      'alice.student@erp.local': { role: 'student', name: 'Alice Johnson' },
      'hr.manager@erp.local': { role: 'hr_personnel', name: 'Helen Rodriguez' },
      'finance.manager@erp.local': { role: 'finance_staff', name: 'David Wilson' },
      'marketing.manager@erp.local': { role: 'marketing_team', name: 'Jennifer Taylor' }
    };
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    if (password !== 'password123') {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    if (!testUsers[email]) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const user = testUsers[email];
    
    // Generate a simple token (in production, use proper JWT)
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    
    res.json({
      success: true,
      data: {
        user: {
          id: email,
          email: email,
          firstName: user.name.split(' ')[0],
          lastName: user.name.split(' ')[1] || '',
          name: user.name,
          role: user.role
        },
        token
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
});
