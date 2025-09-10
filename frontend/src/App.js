import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { Helmet } from 'react-helmet-async';

// Context and hooks
import { useAuth } from './context/AuthContext';

// Components
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorBoundary from './components/Common/ErrorBoundary';
import AnimatedBackground from './components/AnimatedBackground';

// Pages
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ProfilePage from './pages/Profile/ProfilePage';

// Academic Pages
import ICTUCoursesPage from './pages/Academic/ICTUCoursesPage';
import StudentsPage from './pages/Academic/StudentsPage';
import GradesPage from './pages/Academic/GradesPage';
import AttendancePage from './pages/Academic/AttendancePage';

// Finance Pages
import InvoicesPage from './pages/Finance/InvoicesPage';
import PaymentsPage from './pages/Finance/PaymentsPage';
import BudgetsPage from './pages/Finance/BudgetsPage';
import CampaignsPage from './pages/Finance/CampaignsPage';

// HR Pages
import EmployeesPage from './pages/HR/EmployeesPage';
import PayrollPage from './pages/HR/PayrollPage';
import LeavePage from './pages/HR/LeavePage';
import AssetsPage from './pages/HR/AssetsPage';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null, requiredRoles = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role(s)
  if (requiredRoles) {
    // Multiple roles allowed
    if (!requiredRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  } else if (requiredRole) {
    // Single role required (legacy support)
    if (user.role !== requiredRole && user.role !== 'admin' && user.role !== 'system_admin') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Helmet>
        <title>Educational ERP System</title>
        <meta name="description" content="Comprehensive Educational ERP System for managing academic, finance, and HR operations" />
      </Helmet>
      
      <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
        {/* Animated Background */}
        <AnimatedBackground />

        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    {/* Dashboard */}
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/profile" element={<ProfilePage />} />

                    {/* Academic Module */}
                    <Route 
                      path="/academic/courses" 
                      element={
                        <ProtectedRoute requiredRoles={["admin", "system_admin", "lecturer", "faculty_coordinator", "major_coordinator", "student"]}>
                          <ICTUCoursesPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/academic/students" 
                      element={
                        <ProtectedRoute requiredRoles={["admin", "system_admin", "lecturer", "faculty_coordinator", "major_coordinator", "student"]}>
                          <StudentsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/academic/grades" element={<GradesPage />} />
                    <Route path="/academic/attendance" element={<AttendancePage />} />

                    {/* Finance Module */}
                    <Route 
                      path="/finance/invoices" 
                      element={
                        <ProtectedRoute requiredRoles={["admin", "system_admin", "finance_staff"]}>
                          <InvoicesPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/finance/payments" element={<PaymentsPage />} />
                    <Route 
                      path="/finance/budgets" 
                      element={
                        <ProtectedRoute requiredRoles={["admin", "system_admin", "finance_staff"]}>
                          <BudgetsPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/finance/campaigns" 
                      element={
                        <ProtectedRoute requiredRoles={["admin", "system_admin", "marketing_staff"]}>
                          <CampaignsPage />
                        </ProtectedRoute>
                      } 
                    />

                    {/* HR Module */}
                    <Route 
                      path="/hr/employees" 
                      element={
                        <ProtectedRoute requiredRoles={["admin", "system_admin", "hr_staff"]}>
                          <EmployeesPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/hr/payroll" 
                      element={
                        <ProtectedRoute requiredRoles={["admin", "system_admin", "hr_staff"]}>
                          <PayrollPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/hr/leave" element={<LeavePage />} />
                    <Route 
                      path="/hr/assets" 
                      element={
                        <ProtectedRoute requiredRoles={["admin", "system_admin", "hr_staff"]}>
                          <AssetsPage />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Box>
    </ErrorBoundary>
  );
}

export default App;
