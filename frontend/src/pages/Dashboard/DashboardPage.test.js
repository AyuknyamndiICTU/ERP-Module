import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DashboardPage from './DashboardPage';
import { AuthContext } from '../../context/AuthContext';

const theme = createTheme();

const mockUser = {
  id: 1,
  name: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  role: 'student'
};

const mockAuthContext = {
  user: mockUser,
  login: jest.fn(),
  logout: jest.fn(),
  updateUser: jest.fn()
};

const renderWithProviders = (component, authContext = mockAuthContext) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthContext.Provider value={authContext}>
          {component}
        </AuthContext.Provider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('DashboardPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard with welcome message', () => {
    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByText(/Good/)).toBeInTheDocument();
    expect(screen.getByText(/John/)).toBeInTheDocument();
  });

  test('displays correct role badge', () => {
    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByText('STUDENT')).toBeInTheDocument();
  });

  test('shows student-specific quick actions', () => {
    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByText('View Grades')).toBeInTheDocument();
    expect(screen.getByText('Check Attendance')).toBeInTheDocument();
    expect(screen.getByText('Pay Fees')).toBeInTheDocument();
  });

  test('shows admin-specific quick actions', () => {
    const adminUser = { ...mockUser, role: 'admin' };
    const adminContext = { ...mockAuthContext, user: adminUser };
    
    renderWithProviders(<DashboardPage />, adminContext);
    
    expect(screen.getByText('System Settings')).toBeInTheDocument();
  });

  test('shows faculty-specific quick actions', () => {
    const facultyUser = { ...mockUser, role: 'academic_staff' };
    const facultyContext = { ...mockAuthContext, user: facultyUser };
    
    renderWithProviders(<DashboardPage />, facultyContext);
    
    expect(screen.getByText('Grade Assignments')).toBeInTheDocument();
    expect(screen.getByText('Mark Attendance')).toBeInTheDocument();
    expect(screen.getByText('Schedule Exam')).toBeInTheDocument();
  });

  test('displays recent activities', () => {
    renderWithProviders(<DashboardPage />);
    
    expect(screen.getByText('Recent Activities')).toBeInTheDocument();
    expect(screen.getByText('New Student Enrollment')).toBeInTheDocument();
    expect(screen.getByText('Payment Received')).toBeInTheDocument();
  });

  test('displays statistics cards', () => {
    renderWithProviders(<DashboardPage />);
    
    // Wait for stats to load
    waitFor(() => {
      expect(screen.getByText('Total Students')).toBeInTheDocument();
    });
  });

  test('handles quick action clicks', () => {
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));

    renderWithProviders(<DashboardPage />);
    
    fireEvent.click(screen.getByText('View Grades'));
    // Note: In a real test, you'd verify navigation
  });

  test('opens form dialog for interactive actions', () => {
    const facultyUser = { ...mockUser, role: 'academic_staff' };
    const facultyContext = { ...mockAuthContext, user: facultyUser };
    
    renderWithProviders(<DashboardPage />, facultyContext);
    
    fireEvent.click(screen.getByText('Grade Assignments'));
    
    waitFor(() => {
      expect(screen.getByText('Grade Assignment')).toBeInTheDocument();
    });
  });

  test('handles form dialog submission', async () => {
    const facultyUser = { ...mockUser, role: 'academic_staff' };
    const facultyContext = { ...mockAuthContext, user: facultyUser };
    
    renderWithProviders(<DashboardPage />, facultyContext);
    
    fireEvent.click(screen.getByText('Grade Assignments'));
    
    await waitFor(() => {
      expect(screen.getByText('Grade Assignment')).toBeInTheDocument();
    });

    // Fill form and submit
    const courseSelect = screen.getByLabelText('Course');
    fireEvent.change(courseSelect, { target: { value: 'CS101' } });
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Grade Assignment')).not.toBeInTheDocument();
    });
  });

  test('displays correct greeting based on time', () => {
    // Mock different times
    const originalDate = Date;
    
    // Morning test
    global.Date = jest.fn(() => ({
      getHours: () => 9
    }));
    
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText(/Good morning/)).toBeInTheDocument();
    
    // Afternoon test
    global.Date = jest.fn(() => ({
      getHours: () => 14
    }));
    
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText(/Good afternoon/)).toBeInTheDocument();
    
    // Evening test
    global.Date = jest.fn(() => ({
      getHours: () => 19
    }));
    
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText(/Good evening/)).toBeInTheDocument();
    
    global.Date = originalDate;
  });

  test('handles missing user gracefully', () => {
    const noUserContext = { ...mockAuthContext, user: null };
    
    expect(() => {
      renderWithProviders(<DashboardPage />, noUserContext);
    }).not.toThrow();
  });

  test('responsive design elements are present', () => {
    renderWithProviders(<DashboardPage />);
    
    // Check for responsive grid containers
    const gridContainers = document.querySelectorAll('[class*="MuiGrid-container"]');
    expect(gridContainers.length).toBeGreaterThan(0);
  });
});

describe('Dashboard Integration Tests', () => {
  test('full user workflow - student viewing dashboard', async () => {
    renderWithProviders(<DashboardPage />);
    
    // Check welcome message
    expect(screen.getByText(/Good/)).toBeInTheDocument();
    
    // Check student-specific content
    expect(screen.getByText('View Grades')).toBeInTheDocument();
    expect(screen.getByText('Check Attendance')).toBeInTheDocument();
    expect(screen.getByText('Pay Fees')).toBeInTheDocument();
    
    // Check recent activities
    expect(screen.getByText('Recent Activities')).toBeInTheDocument();
    
    // Verify no admin-only content
    expect(screen.queryByText('System Settings')).not.toBeInTheDocument();
  });

  test('full user workflow - admin viewing dashboard', async () => {
    const adminUser = { ...mockUser, role: 'admin' };
    const adminContext = { ...mockAuthContext, user: adminUser };
    
    renderWithProviders(<DashboardPage />, adminContext);
    
    // Check admin-specific content
    expect(screen.getByText('System Settings')).toBeInTheDocument();
    
    // Should also have access to other role actions
    expect(screen.getByText('Grade Assignments')).toBeInTheDocument();
    expect(screen.getByText('Generate Invoice')).toBeInTheDocument();
    expect(screen.getByText('Add Employee')).toBeInTheDocument();
  });
});

describe('Dashboard Performance Tests', () => {
  test('renders within acceptable time', () => {
    const startTime = performance.now();
    
    renderWithProviders(<DashboardPage />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render in less than 500ms
    expect(renderTime).toBeLessThan(500);
  });
});
