import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  // Remove auth token
  removeAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  },

  // Login
  login: (credentials) => api.post('/auth/login', credentials),

  // Register
  register: (userData) => api.post('/auth/register', userData),

  // Logout
  logout: () => api.post('/auth/logout'),

  // Get user profile
  getProfile: () => api.get('/users/profile'),

  // Update profile
  updateProfile: (profileData) => api.put('/users/profile', profileData),

  // Change password
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),

  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', email),

  // Reset password
  resetPassword: (resetData) => api.post('/auth/reset-password', resetData),

  // Refresh token
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// Users API
export const usersAPI = {
  // Get all users
  getUsers: (params) => api.get('/users', { params }),

  // Get user by ID
  getUser: (id) => api.get(`/users/${id}`),

  // Update user
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),

  // Delete user
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Academic API
export const academicAPI = {
  // Courses
  getCourses: (params) => api.get('/academic/courses', { params }),
  getCourse: (id) => api.get(`/academic/courses/${id}`),
  createCourse: (courseData) => api.post('/academic/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/academic/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/academic/courses/${id}`),

  // Students
  getStudents: (params) => api.get('/academic/students', { params }),
  getStudent: (id) => api.get(`/academic/students/${id}`),
  createStudent: (studentData) => api.post('/academic/students', studentData),
  updateStudent: (id, studentData) => api.put(`/academic/students/${id}`, studentData),
  deleteStudent: (id) => api.delete(`/academic/students/${id}`),

  // Enrollments
  getEnrollments: (params) => api.get('/academic/enrollments', { params }),
  createEnrollment: (enrollmentData) => api.post('/academic/enrollments', enrollmentData),
  updateEnrollment: (id, enrollmentData) => api.put(`/academic/enrollments/${id}`, enrollmentData),
  deleteEnrollment: (id) => api.delete(`/academic/enrollments/${id}`),

  // Grades
  getGrades: (params) => api.get('/academic/grades', { params }),
  createGrade: (gradeData) => api.post('/academic/grades', gradeData),
  updateGrade: (id, gradeData) => api.put(`/academic/grades/${id}`, gradeData),
  deleteGrade: (id) => api.delete(`/academic/grades/${id}`),

  // Attendance
  getAttendance: (params) => api.get('/academic/attendance', { params }),
  markAttendance: (attendanceData) => api.post('/academic/attendance', attendanceData),
  updateAttendance: (id, attendanceData) => api.put(`/academic/attendance/${id}`, attendanceData),

  // Exams
  getExams: (params) => api.get('/academic/exams', { params }),
  createExam: (examData) => api.post('/academic/exams', examData),
  updateExam: (id, examData) => api.put(`/academic/exams/${id}`, examData),
  deleteExam: (id) => api.delete(`/academic/exams/${id}`),

  // Reports
  getTranscript: (studentId) => api.get(`/academic/reports/transcripts/${studentId}`),
  getAttendanceReport: (params) => api.get('/academic/reports/attendance', { params }),
};

// Finance API
export const financeAPI = {
  // Invoices
  getInvoices: (params) => api.get('/finance/invoices', { params }),
  getInvoice: (id) => api.get(`/finance/invoices/${id}`),
  createInvoice: (invoiceData) => api.post('/finance/invoices', invoiceData),
  updateInvoice: (id, invoiceData) => api.put(`/finance/invoices/${id}`, invoiceData),
  deleteInvoice: (id) => api.delete(`/finance/invoices/${id}`),

  // Payments
  getPayments: (params) => api.get('/finance/payments', { params }),
  processPayment: (paymentData) => api.post('/finance/payments', paymentData),
  updatePayment: (id, paymentData) => api.put(`/finance/payments/${id}`, paymentData),

  // Budgets
  getBudgets: (params) => api.get('/finance/budgets', { params }),
  createBudget: (budgetData) => api.post('/finance/budgets', budgetData),
  updateBudget: (id, budgetData) => api.put(`/finance/budgets/${id}`, budgetData),
  deleteBudget: (id) => api.delete(`/finance/budgets/${id}`),

  // Expenses
  getExpenses: (params) => api.get('/finance/expenses', { params }),
  createExpense: (expenseData) => api.post('/finance/expenses', expenseData),
  updateExpense: (id, expenseData) => api.put(`/finance/expenses/${id}`, expenseData),
  deleteExpense: (id) => api.delete(`/finance/expenses/${id}`),

  // Campaigns
  getCampaigns: (params) => api.get('/finance/campaigns', { params }),
  createCampaign: (campaignData) => api.post('/finance/campaigns', campaignData),
  updateCampaign: (id, campaignData) => api.put(`/finance/campaigns/${id}`, campaignData),
  deleteCampaign: (id) => api.delete(`/finance/campaigns/${id}`),

  // Leads
  getLeads: (params) => api.get('/finance/leads', { params }),
  createLead: (leadData) => api.post('/finance/leads', leadData),
  updateLead: (id, leadData) => api.put(`/finance/leads/${id}`, leadData),
  deleteLead: (id) => api.delete(`/finance/leads/${id}`),

  // Reports
  getFinancialSummary: (params) => api.get('/finance/reports/financial-summary', { params }),
  getCampaignROI: (params) => api.get('/finance/reports/campaign-roi', { params }),
  getBudgetVariance: (params) => api.get('/finance/reports/budget-variance', { params }),
};

// HR API
export const hrAPI = {
  // Employees
  getEmployees: (params) => api.get('/hr/employees', { params }),
  getEmployee: (id) => api.get(`/hr/employees/${id}`),
  createEmployee: (employeeData) => api.post('/hr/employees', employeeData),
  updateEmployee: (id, employeeData) => api.put(`/hr/employees/${id}`, employeeData),
  deleteEmployee: (id) => api.delete(`/hr/employees/${id}`),

  // Payroll
  getPayroll: (params) => api.get('/hr/payroll', { params }),
  processPayroll: (payrollData) => api.post('/hr/payroll', payrollData),
  updatePayroll: (id, payrollData) => api.put(`/hr/payroll/${id}`, payrollData),

  // Leave Requests
  getLeaveRequests: (params) => api.get('/hr/leave-requests', { params }),
  submitLeaveRequest: (leaveData) => api.post('/hr/leave-requests', leaveData),
  approveLeaveRequest: (id, approvalData) => api.put(`/hr/leave-requests/${id}/approve`, approvalData),
  updateLeaveRequest: (id, leaveData) => api.put(`/hr/leave-requests/${id}`, leaveData),

  // Performance Reviews
  getPerformanceReviews: (params) => api.get('/hr/performance-reviews', { params }),
  createPerformanceReview: (reviewData) => api.post('/hr/performance-reviews', reviewData),
  updatePerformanceReview: (id, reviewData) => api.put(`/hr/performance-reviews/${id}`, reviewData),

  // Assets
  getAssets: (params) => api.get('/hr/assets', { params }),
  createAsset: (assetData) => api.post('/hr/assets', assetData),
  updateAsset: (id, assetData) => api.put(`/hr/assets/${id}`, assetData),
  assignAsset: (id, assignmentData) => api.put(`/hr/assets/${id}/assign`, assignmentData),
  deleteAsset: (id) => api.delete(`/hr/assets/${id}`),

  // Job Postings
  getJobPostings: (params) => api.get('/hr/job-postings', { params }),
  createJobPosting: (jobData) => api.post('/hr/job-postings', jobData),
  updateJobPosting: (id, jobData) => api.put(`/hr/job-postings/${id}`, jobData),
  deleteJobPosting: (id) => api.delete(`/hr/job-postings/${id}`),

  // Reports
  getEmployeeSummary: (params) => api.get('/hr/reports/employee-summary', { params }),
  getPayrollSummary: (params) => api.get('/hr/reports/payroll-summary', { params }),
};

// File upload API
export const fileAPI = {
  upload: (file, entityType, entityId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);
    
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  download: (fileId) => api.get(`/files/${fileId}/download`, {
    responseType: 'blob',
  }),
  
  delete: (fileId) => api.delete(`/files/${fileId}`),
};

export default api;
