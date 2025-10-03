import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Avatar,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import FormDialog from '../../components/Common/FormDialog';
import GlassCard from '../../components/GlassCard';
import { hrAPI } from '../../services/api';
import { debounce } from 'lodash';

const EmployeesPage = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Mock data
  const mockEmployees = [
    {
      id: 1,
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@university.edu',
      phone: '+1-555-0101',
      department: 'Computer Science',
      position: 'Professor',
      status: 'active',
      hireDate: '2020-01-15',
      salary: 75000
    },
    {
      id: 2,
      employeeId: 'EMP002',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@university.edu',
      phone: '+1-555-0102',
      department: 'Mathematics',
      position: 'Associate Professor',
      status: 'active',
      hireDate: '2019-08-20',
      salary: 68000
    },
    {
      id: 3,
      employeeId: 'EMP003',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@university.edu',
      phone: '+1-555-0103',
      department: 'Administration',
      position: 'HR Manager',
      status: 'active',
      hireDate: '2021-03-10',
      salary: 55000
    },
    {
      id: 4,
      employeeId: 'EMP004',
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@university.edu',
      phone: '+1-555-0104',
      department: 'Finance',
      position: 'Finance Officer',
      status: 'inactive',
      hireDate: '2018-11-05',
      salary: 50000
    }
  ];

  // Fetch employees from backend
  const fetchEmployees = useCallback(async (search = '', page = 1) => {
    try {
      setLoading(true);
      const response = await hrAPI.getEmployees({ 
        search, 
        page, 
        limit: pagination.limit 
      });
      
      if (response.data && response.data.employees) {
        setEmployees(response.data.employees);
        setPagination(prev => ({
          ...prev,
          page: response.data.currentPage || page,
          total: response.data.total || response.data.employees.length
        }));
      } else {
        // Fallback to mock data if API fails
        console.warn('API response invalid, using fallback data');
        setEmployees(mockEmployees);
        setPagination(prev => ({ ...prev, total: mockEmployees.length }));
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Use fallback mock data
      setEmployees(mockEmployees);
      setPagination(prev => ({ ...prev, total: mockEmployees.length }));
      setSnackbar({
        open: true,
        message: 'Failed to load employees. Using offline data.',
        severity: 'warning'
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // Fetch departments for dropdown
  const fetchDepartments = useCallback(async () => {
    try {
      const response = await hrAPI.getDepartments();
      if (response.data) {
        setDepartments(response.data.map(dept => ({
          value: dept.name || dept.departmentName,
          label: dept.name || dept.departmentName
        })));
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Use fallback departments
      setDepartments([
        { value: 'Computer Science', label: 'Computer Science' },
        { value: 'Mathematics', label: 'Mathematics' },
        { value: 'Physics', label: 'Physics' },
        { value: 'Administration', label: 'Administration' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Human Resources', label: 'Human Resources' }
      ]);
    }
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      fetchEmployees(searchValue, 1);
    }, 500),
    [fetchEmployees]
  );

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [fetchEmployees, fetchDepartments]);

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      fetchEmployees('', 1);
    }
  }, [searchTerm, debouncedSearch, fetchEmployees]);

  const handleAddEmployee = async (formData) => {
    try {
      const response = await hrAPI.createEmployee({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        position: formData.position,
        salary: parseFloat(formData.salary),
        hireDate: formData.hireDate || new Date().toISOString().split('T')[0],
        status: 'active'
      });

      if (response.data) {
        setSnackbar({
          open: true,
          message: 'Employee added successfully!',
          severity: 'success'
        });
        setShowAddDialog(false);
        fetchEmployees(searchTerm, pagination.page);
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to add employee',
        severity: 'error'
      });
    }
  };

  const handleEditEmployee = async (formData) => {
    try {
      const response = await hrAPI.updateEmployee(selectedEmployee.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        position: formData.position,
        salary: parseFloat(formData.salary),
        status: formData.status
      });

      if (response.data) {
        setSnackbar({
          open: true,
          message: 'Employee updated successfully!',
          severity: 'success'
        });
        setShowEditDialog(false);
        setSelectedEmployee(null);
        fetchEmployees(searchTerm, pagination.page);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update employee',
        severity: 'error'
      });
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await hrAPI.deleteEmployee(employeeId);
        setSnackbar({
          open: true,
          message: 'Employee deleted successfully!',
          severity: 'success'
        });
        fetchEmployees(searchTerm, pagination.page);
      } catch (error) {
        console.error('Error deleting employee:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to delete employee',
          severity: 'error'
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'on_leave': return 'warning';
      default: return 'default';
    }
  };

  // Use employees directly since filtering is handled by backend API
  const filteredEmployees = employees;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="700" sx={{ color: 'primary.main' }}>
          Employee Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            }
          }}
        >
          Add Employee
        </Button>
      </Box>

      {/* Search */}
      <GlassCard sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </GlassCard>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    {filteredEmployees.length}
                  </Typography>
                  <Typography variant="body2">Total Employees</Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    {filteredEmployees.filter(emp => emp.status === 'active').length}
                  </Typography>
                  <Typography variant="body2">Active</Typography>
                </Box>
                <WorkIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    {new Set(filteredEmployees.map(emp => emp.department)).size}
                  </Typography>
                  <Typography variant="body2">Departments</Typography>
                </Box>
                <WorkIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    {(filteredEmployees.reduce((sum, emp) => sum + emp.salary, 0) / 1000).toFixed(0)}K FCFA
                  </Typography>
                  <Typography variant="body2">Total Payroll</Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Employees Table */}
      <GlassCard>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Employee ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Position</strong></TableCell>
                <TableCell><strong>Contact</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id} hover>
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {employee.firstName} {employee.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Hired: {new Date(employee.hireDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="caption">{employee.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="caption">{employee.phone}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        backgroundColor: employee.status === 'active' ? '#10b981' : 
                                       employee.status === 'inactive' ? '#ef4444' : 
                                       employee.status === 'on_leave' ? '#f59e0b' : 
                                       employee.status === 'terminated' ? '#dc2626' : '#6b7280',
                        color: 'white',
                        '& .MuiChip-label': {
                          color: 'white'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedEmployee(employee);
                      }}
                      sx={{ color: 'primary.main' }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setShowEditDialog(true);
          setAnchorEl(null);
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Employee
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeleteEmployee(selectedEmployee.id);
          setAnchorEl(null);
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Employee
        </MenuItem>
      </Menu>

      {/* Add Employee Dialog */}
      <FormDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        title="Add New Employee"
        fields={[
          { name: 'firstName', label: 'First Name', type: 'text', required: true, width: 6 },
          { name: 'lastName', label: 'Last Name', type: 'text', required: true, width: 6 },
          { name: 'email', label: 'Email Address', type: 'email', required: true },
          { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
          { name: 'department', label: 'Department', type: 'select', required: true, options: departments },
          { name: 'position', label: 'Position', type: 'text', required: true },
          { name: 'salary', label: 'Annual Salary (FCFA)', type: 'number', required: true, min: 0 }
        ]}
        onSave={handleAddEmployee}
      />

      {/* Edit Employee Dialog */}
      <FormDialog
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedEmployee(null);
        }}
        title="Edit Employee"
        initialData={selectedEmployee}
        fields={[
          { name: 'firstName', label: 'First Name', type: 'text', required: true, width: 6 },
          { name: 'lastName', label: 'Last Name', type: 'text', required: true, width: 6 },
          { name: 'email', label: 'Email Address', type: 'email', required: true },
          { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
          { name: 'department', label: 'Department', type: 'select', required: true, options: departments },
          { name: 'position', label: 'Position', type: 'text', required: true },
          { name: 'salary', label: 'Annual Salary (FCFA)', type: 'number', required: true, min: 0 },
          { name: 'status', label: 'Status', type: 'select', required: true, options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'on_leave', label: 'On Leave' },
            { value: 'terminated', label: 'Terminated' }
          ]}
        ]}
        onSave={handleEditEmployee}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeesPage;
