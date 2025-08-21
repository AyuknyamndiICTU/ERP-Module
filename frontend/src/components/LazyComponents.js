import React, { lazy, Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// Loading component
const LoadingFallback = ({ message = 'Loading...' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      gap: 2
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

// Lazy load all major page components
export const LazyDashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));
export const LazyProfilePage = lazy(() => import('../pages/Profile/ProfilePage'));

// Academic Module
export const LazyCoursesPage = lazy(() => import('../pages/Academic/CoursesPage'));
export const LazyGradesPage = lazy(() => import('../pages/Academic/GradesPage'));
export const LazyAttendancePage = lazy(() => import('../pages/Academic/AttendancePage'));
export const LazyStudentsPage = lazy(() => import('../pages/Academic/StudentsPage'));

// Finance Module
export const LazyPaymentsPage = lazy(() => import('../pages/Finance/PaymentsPage'));
export const LazyInvoicesPage = lazy(() => import('../pages/Finance/InvoicesPage'));
export const LazyBudgetsPage = lazy(() => import('../pages/Finance/BudgetsPage'));
export const LazyCampaignsPage = lazy(() => import('../pages/Finance/CampaignsPage'));

// HR Module
export const LazyEmployeesPage = lazy(() => import('../pages/HR/EmployeesPage'));
export const LazyPayrollPage = lazy(() => import('../pages/HR/PayrollPage'));
export const LazyLeavePage = lazy(() => import('../pages/HR/LeavePage'));
export const LazyAssetsPage = lazy(() => import('../pages/HR/AssetsPage'));

// Auth Module
export const LazyLoginPage = lazy(() => import('../pages/Auth/LoginPage'));

// Higher-order component for lazy loading with custom fallback
export const withLazyLoading = (LazyComponent, fallbackMessage) => {
  return (props) => (
    <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Pre-configured lazy components with specific loading messages
export const DashboardPage = withLazyLoading(LazyDashboardPage, 'Loading Dashboard...');
export const ProfilePage = withLazyLoading(LazyProfilePage, 'Loading Profile...');

export const CoursesPage = withLazyLoading(LazyCoursesPage, 'Loading Courses...');
export const GradesPage = withLazyLoading(LazyGradesPage, 'Loading Grades...');
export const AttendancePage = withLazyLoading(LazyAttendancePage, 'Loading Attendance...');
export const StudentsPage = withLazyLoading(LazyStudentsPage, 'Loading Students...');

export const PaymentsPage = withLazyLoading(LazyPaymentsPage, 'Loading Payments...');
export const InvoicesPage = withLazyLoading(LazyInvoicesPage, 'Loading Invoices...');
export const BudgetsPage = withLazyLoading(LazyBudgetsPage, 'Loading Budgets...');
export const CampaignsPage = withLazyLoading(LazyCampaignsPage, 'Loading Campaigns...');

export const EmployeesPage = withLazyLoading(LazyEmployeesPage, 'Loading Employees...');
export const PayrollPage = withLazyLoading(LazyPayrollPage, 'Loading Payroll...');
export const LeavePage = withLazyLoading(LazyLeavePage, 'Loading Leave Management...');
export const AssetsPage = withLazyLoading(LazyAssetsPage, 'Loading Assets...');

export const LoginPage = withLazyLoading(LazyLoginPage, 'Loading Login...');

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload dashboard and profile as they're most commonly accessed
  LazyDashboardPage();
  LazyProfilePage();
  LazyCoursesPage();
};

// Component for preloading on user interaction
export const PreloadOnHover = ({ children, componentToPreload }) => {
  const handleMouseEnter = () => {
    if (componentToPreload) {
      componentToPreload();
    }
  };

  return (
    <div onMouseEnter={handleMouseEnter}>
      {children}
    </div>
  );
};

// Hook for dynamic imports
export const useDynamicImport = (importFunc) => {
  const [component, setComponent] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const loadComponent = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const module = await importFunc();
      setComponent(module.default || module);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [importFunc]);

  return { component, loading, error, loadComponent };
};

// Error boundary for lazy components
export class LazyLoadErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            gap: 2,
            p: 3
          }}
        >
          <Typography variant="h6" color="error">
            Failed to load component
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please refresh the page or try again later.
          </Typography>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Wrapper component that combines error boundary with suspense
export const LazyWrapper = ({ children, fallbackMessage }) => (
  <LazyLoadErrorBoundary>
    <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
      {children}
    </Suspense>
  </LazyLoadErrorBoundary>
);

export default {
  DashboardPage,
  ProfilePage,
  CoursesPage,
  GradesPage,
  AttendancePage,
  StudentsPage,
  PaymentsPage,
  InvoicesPage,
  BudgetsPage,
  CampaignsPage,
  EmployeesPage,
  PayrollPage,
  LeavePage,
  AssetsPage,
  LoginPage,
  preloadCriticalComponents,
  PreloadOnHover,
  useDynamicImport,
  LazyWrapper
};
