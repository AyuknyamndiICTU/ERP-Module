import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';

const EmployeesPage = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

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

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEmployees(mockEmployees);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'on_leave': return 'warning';
      default: return 'default';
    }
  };

  const filteredEmployees = employees.filter(employee => 
    `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                    ${(filteredEmployees.reduce((sum, emp) => sum + emp.salary, 0) / 1000).toFixed(0)}K
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
                      color={getStatusColor(employee.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
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
        <MenuItem onClick={() => setAnchorEl(null)}>
          <PersonIcon sx={{ mr: 1 }} />
          View Profile
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <WorkIcon sx={{ mr: 1 }} />
          Edit Details
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <EmailIcon sx={{ mr: 1 }} />
          Send Message
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default EmployeesPage;
