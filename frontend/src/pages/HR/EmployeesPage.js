import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
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
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { useApiData, useDialogState } from '../../hooks/useApiData';
import { FormDialog, ConfirmDialog, DetailDialog } from '../../components/Common/DialogComponents';
import GlassCard from '../../components/GlassCard';
import logger from '../../utils/logger';

const EmployeesPage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Mock API service for employees
  const mockEmployeeService = {
    getAll: async () => ({
      data: {
        success: true,
        data: [
          {
            id: 1,
            employeeId: 'EMP001',
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@erp.local',
            phone: '+1-555-0101',
            position: 'Senior Professor',
            department: 'Computer Science',
            salary: 75000,
            hireDate: '2020-01-15',
            status: 'active',
            address: '123 Main St, City, State 12345',
            emergencyContact: 'Jane Smith - +1-555-0102'
          },
          {
            id: 2,
            employeeId: 'EMP002',
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah.johnson@erp.local',
            phone: '+1-555-0201',
            position: 'HR Manager',
            department: 'Human Resources',
            salary: 65000,
            hireDate: '2019-03-20',
            status: 'active',
            address: '456 Oak Ave, City, State 12345',
            emergencyContact: 'Mike Johnson - +1-555-0202'
          },
          {
            id: 3,
            employeeId: 'EMP003',
            firstName: 'Michael',
            lastName: 'Brown',
            email: 'michael.brown@erp.local',
            phone: '+1-555-0301',
            position: 'Finance Analyst',
            department: 'Finance',
            salary: 55000,
            hireDate: '2021-06-10',
            status: 'active',
            address: '789 Pine St, City, State 12345',
            emergencyContact: 'Lisa Brown - +1-555-0302'
          },
          {
            id: 4,
            employeeId: 'EMP004',
            firstName: 'Emily',
            lastName: 'Davis',
            email: 'emily.davis@erp.local',
            phone: '+1-555-0401',
            position: 'Assistant Professor',
            department: 'Mathematics',
            salary: 60000,
            hireDate: '2022-08-01',
            status: 'on_leave',
            address: '321 Elm St, City, State 12345',
            emergencyContact: 'Robert Davis - +1-555-0402'
          }
        ]
      }
    }),
    create: async (data) => ({
      data: {
        success: true,
        data: { id: Date.now(), ...data, employeeId: `EMP${String(Date.now()).slice(-3)}` }
      }
    }),
    update: async (id, data) => ({ data: { success: true, data: { id, ...data } } }),
    delete: async (id) => ({ data: { success: true } }),
    getById: async (id) => ({ data: { success: true, data: {} } })
  };

  const { data: employees, loading, createItem, updateItem, deleteItem, handleSearch } = useApiData(mockEmployeeService);
  const { dialogs, selectedItem, openDialog, closeDialog } = useDialogState();

  const employeeFields = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true, width: 6 },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true, width: 6 },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'text', required: true },
    { name: 'position', label: 'Position', type: 'select', required: true, options: [
      { value: 'Professor', label: 'Professor' },
      { value: 'Senior Professor', label: 'Senior Professor' },
      { value: 'Assistant Professor', label: 'Assistant Professor' },
      { value: 'HR Manager', label: 'HR Manager' },
      { value: 'HR Assistant', label: 'HR Assistant' },
      { value: 'Finance Manager', label: 'Finance Manager' },
      { value: 'Finance Analyst', label: 'Finance Analyst' },
      { value: 'Administrator', label: 'Administrator' },
      { value: 'Support Staff', label: 'Support Staff' }
    ]},
    { name: 'department', label: 'Department', type: 'select', required: true, options: [
      { value: 'Computer Science', label: 'Computer Science' },
      { value: 'Mathematics', label: 'Mathematics' },
      { value: 'Physics', label: 'Physics' },
      { value: 'Chemistry', label: 'Chemistry' },
      { value: 'English', label: 'English' },
      { value: 'Human Resources', label: 'Human Resources' },
      { value: 'Finance', label: 'Finance' },
      { value: 'Administration', label: 'Administration' }
    ]},
    { name: 'salary', label: 'Annual Salary ($)', type: 'number', required: true, min: 0 },
    { name: 'hireDate', label: 'Hire Date', type: 'date', required: true },
    { name: 'address', label: 'Address', type: 'textarea', rows: 2 },
    { name: 'emergencyContact', label: 'Emergency Contact', type: 'text' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'on_leave': return 'warning';
      case 'terminated': return 'error';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const handleMenuClick = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleCreateEmployee = async (data) => {
    try {
      await createItem({
        ...data,
        status: 'active'
      });
      closeDialog('create');
    } catch (error) {
      logger.error('Error creating employee:', error);
    }
  };

  const handleUpdateEmployee = async (data) => {
    try {
      await updateItem(selectedItem.id, data);
      closeDialog('edit');
    } catch (error) {
      logger.error('Error updating employee:', error);
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      await deleteItem(selectedItem.id);
      closeDialog('delete');
    } catch (error) {
      logger.error('Error deleting employee:', error);
    }
  };

  // Calculate summary statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const onLeaveEmployees = employees.filter(emp => emp.status === 'on_leave').length;
  const averageSalary = employees.length > 0 ? employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length : 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="700">
          Employee Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openDialog('create')}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
          }}
        >
          Add Employee
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Employees
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {totalEmployees}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="success.main" gutterBottom>
                Active
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {activeEmployees}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="warning.main" gutterBottom>
                On Leave
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {onLeaveEmployees}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Avg Salary
              </Typography>
              <Typography variant="h4" fontWeight="700">
                ${Math.round(averageSalary).toLocaleString()}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <GlassCard sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search employees..."
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{ minWidth: 120 }}
          >
            Filter
          </Button>
        </Box>
      </GlassCard>

      {/* Employees Table */}
      <GlassCard>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Salary</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}>
                        {employee.firstName[0]}{employee.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {employee.firstName} {employee.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {employee.employeeId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {employee.position}
                    </Typography>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" fontSize="0.8rem">
                          {employee.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" fontSize="0.8rem">
                          {employee.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      ${employee.salary.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={employee.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(employee.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, employee)}
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
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { openDialog('detail', selectedEmployee); handleMenuClose(); }}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          View Profile
        </MenuItem>
        <MenuItem onClick={() => { openDialog('edit', selectedEmployee); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Employee
        </MenuItem>
        <MenuItem onClick={() => { logger.debug('View payroll:', selectedEmployee); handleMenuClose(); }}>
          <WorkIcon sx={{ mr: 1 }} fontSize="small" />
          View Payroll
        </MenuItem>
        <MenuItem onClick={() => { logger.debug('Generate ID badge:', selectedEmployee); handleMenuClose(); }}>
          <BadgeIcon sx={{ mr: 1 }} fontSize="small" />
          Generate ID Badge
        </MenuItem>
        <MenuItem onClick={() => { openDialog('delete', selectedEmployee); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Remove Employee
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <FormDialog
        open={dialogs.create}
        onClose={() => closeDialog('create')}
        title="Add New Employee"
        fields={employeeFields}
        onSave={handleCreateEmployee}
        loading={loading}
      />

      <FormDialog
        open={dialogs.edit}
        onClose={() => closeDialog('edit')}
        title="Edit Employee"
        fields={employeeFields}
        data={selectedItem}
        onSave={handleUpdateEmployee}
        loading={loading}
      />

      <DetailDialog
        open={dialogs.detail}
        onClose={() => closeDialog('detail')}
        title="Employee Profile"
        data={selectedItem}
        fields={[
          { name: 'employeeId', label: 'Employee ID' },
          { name: 'firstName', label: 'First Name', width: 6 },
          { name: 'lastName', label: 'Last Name', width: 6 },
          { name: 'email', label: 'Email' },
          { name: 'phone', label: 'Phone' },
          { name: 'position', label: 'Position' },
          { name: 'department', label: 'Department' },
          { name: 'salary', label: 'Annual Salary', render: (value) => `$${value?.toLocaleString()}` },
          { name: 'hireDate', label: 'Hire Date' },
          { name: 'status', label: 'Status', render: (value) => (
            <Chip label={value?.replace('_', ' ').toUpperCase()} color={getStatusColor(value)} size="small" />
          )},
          { name: 'address', label: 'Address', width: 12 },
          { name: 'emergencyContact', label: 'Emergency Contact', width: 12 }
        ]}
        actions={[
          {
            label: 'Edit',
            onClick: () => { closeDialog('detail'); openDialog('edit', selectedItem); },
            icon: <EditIcon />,
            variant: 'outlined'
          },
          {
            label: 'View Payroll',
            onClick: () => logger.debug('View payroll:', selectedItem),
            icon: <WorkIcon />,
            variant: 'contained'
          }
        ]}
      />

      <ConfirmDialog
        open={dialogs.delete}
        onClose={() => closeDialog('delete')}
        onConfirm={handleDeleteEmployee}
        title="Remove Employee"
        message={`Are you sure you want to remove ${selectedItem?.firstName} ${selectedItem?.lastName} from the system? This action cannot be undone.`}
        confirmText="Remove"
        severity="error"
        loading={loading}
      />
    </Box>
  );
};

export default EmployeesPage;
