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
  Grid,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BudgetIcon,
  Visibility as ViewIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import FormDialog from '../../components/Common/FormDialog';

const BudgetsPage = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Mock data
  const mockBudgets = [
    {
      id: 1,
      name: 'Academic Year 2024-2025',
      category: 'Academic',
      totalAmount: 500000,
      spentAmount: 325000,
      remainingAmount: 175000,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      department: 'Academic Affairs'
    },
    {
      id: 2,
      name: 'IT Infrastructure Upgrade',
      category: 'Technology',
      totalAmount: 200000,
      spentAmount: 150000,
      remainingAmount: 50000,
      startDate: '2024-03-01',
      endDate: '2024-08-31',
      status: 'active',
      department: 'IT Department'
    },
    {
      id: 3,
      name: 'Marketing Campaign Q4',
      category: 'Marketing',
      totalAmount: 75000,
      spentAmount: 75000,
      remainingAmount: 0,
      startDate: '2024-10-01',
      endDate: '2024-12-31',
      status: 'completed',
      department: 'Marketing'
    },
    {
      id: 4,
      name: 'Facility Maintenance',
      category: 'Operations',
      totalAmount: 120000,
      spentAmount: 45000,
      remainingAmount: 75000,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      department: 'Operations'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBudgets(mockBudgets);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'overbudget': return 'error';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const getBudgetUtilization = (spent, total) => {
    return (spent / total) * 100;
  };

  const handleAddBudget = (formData) => {
    const newBudget = {
      id: budgets.length + 1,
      name: formData.name,
      category: formData.category,
      totalAmount: parseFloat(formData.totalAmount),
      spentAmount: 0,
      remainingAmount: parseFloat(formData.totalAmount),
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: 'active',
      department: formData.department
    };
    
    setBudgets([...budgets, newBudget]);
    setShowAddDialog(false);
  };

  const budgetFields = [
    { name: 'name', label: 'Budget Name', type: 'text', required: true },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { value: 'Academic', label: 'Academic' },
        { value: 'Technology', label: 'Technology' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Operations', label: 'Operations' },
        { value: 'HR', label: 'Human Resources' }
      ]
    },
    { name: 'totalAmount', label: 'Total Amount (FCFA)', type: 'number', required: true },
    { name: 'startDate', label: 'Start Date', type: 'date', required: true },
    { name: 'endDate', label: 'End Date', type: 'date', required: true },
    { name: 'department', label: 'Department', type: 'text', required: true }
  ];

  const filteredBudgets = budgets.filter(budget =>
    budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBudgetAmount = budgets.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalSpentAmount = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalRemainingAmount = budgets.reduce((sum, b) => sum + b.remainingAmount, 0);

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
          Budget Management
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
          Create Budget
        </Button>
      </Box>

      {/* Search */}
      <GlassCard sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search budgets..."
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

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="700">
                    {budgets.length}
                  </Typography>
                  <Typography variant="body2">Total Budgets</Typography>
                </Box>
                <BudgetIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {(totalBudgetAmount / 1000000).toFixed(1)}M FCFA
                  </Typography>
                  <Typography variant="body2">Total Allocated</Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {(totalSpentAmount / 1000000).toFixed(1)}M FCFA
                  </Typography>
                  <Typography variant="body2">Total Spent</Typography>
                </Box>
                <TrendingDownIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {(totalRemainingAmount / 1000000).toFixed(1)}M FCFA
                  </Typography>
                  <Typography variant="body2">Remaining</Typography>
                </Box>
                <BudgetIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Budgets Table */}
      <GlassCard>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Budget Name</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Total Amount</strong></TableCell>
                <TableCell><strong>Spent</strong></TableCell>
                <TableCell><strong>Remaining</strong></TableCell>
                <TableCell><strong>Utilization</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBudgets.map((budget) => {
                const utilization = getBudgetUtilization(budget.spentAmount, budget.totalAmount);
                return (
                  <TableRow key={budget.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {budget.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={budget.category}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{budget.department}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600" color="primary.main">
                        {budget.totalAmount.toLocaleString()} FCFA
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600" color="warning.main">
                        {budget.spentAmount.toLocaleString()} FCFA
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600" color="success.main">
                        {budget.remainingAmount.toLocaleString()} FCFA
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(utilization, 100)}
                          color={utilization > 90 ? 'error' : utilization > 75 ? 'warning' : 'success'}
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="caption">
                          {utilization.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
                        color={getStatusColor(budget.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedBudget(budget);
                        }}
                        sx={{ color: 'primary.main' }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
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
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Budget
        </MenuItem>
      </Menu>

      {/* Add Budget Dialog */}
      <FormDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        title="Create New Budget"
        fields={budgetFields}
        onSave={handleAddBudget}
      />
    </Box>
  );
};

export default BudgetsPage;
