import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Fab
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Payment,
  Receipt,
  TrendingUp,
  AccountBalance,
  Campaign,
  People
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../common/RoleGuard';

const FinanceModule = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    invoices: [],
    payments: [],
    budgets: [],
    campaigns: [],
    expenses: []
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');

  const canManageFinance = ['admin', 'finance_staff'].includes(user?.role);

  // Prevent freezing by using proper async data loading
  useEffect(() => {
    loadFinanceData();
  }, [activeTab]);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      // Simulate API calls with proper error handling
      await new Promise(resolve => setTimeout(resolve, 500));
      
      switch (activeTab) {
        case 0: // Invoices
          setData(prev => ({
            ...prev,
            invoices: [
              {
                id: 1,
                studentName: 'John Doe',
                amount: 5000,
                dueDate: '2024-12-31',
                status: 'pending',
                invoiceNumber: 'INV-001'
              },
              {
                id: 2,
                studentName: 'Jane Smith',
                amount: 4500,
                dueDate: '2024-12-25',
                status: 'paid',
                invoiceNumber: 'INV-002'
              }
            ]
          }));
          break;
        case 1: // Payments
          setData(prev => ({
            ...prev,
            payments: [
              {
                id: 1,
                studentName: 'Jane Smith',
                amount: 4500,
                date: '2024-12-20',
                method: 'Credit Card',
                status: 'completed'
              }
            ]
          }));
          break;
        case 2: // Budgets
          // Add timeout to prevent freezing
          await new Promise(resolve => setTimeout(resolve, 100));
          setData(prev => ({
            ...prev,
            budgets: [
              {
                id: 1,
                name: 'Academic Year 2024',
                allocated: 100000,
                spent: 65000,
                remaining: 35000,
                category: 'Operations',
                status: 'active'
              },
              {
                id: 2,
                name: 'Infrastructure Budget',
                allocated: 75000,
                spent: 32000,
                remaining: 43000,
                category: 'Infrastructure',
                status: 'active'
              },
              {
                id: 3,
                name: 'Marketing Budget',
                allocated: 25000,
                spent: 18500,
                remaining: 6500,
                category: 'Marketing',
                status: 'active'
              }
            ]
          }));
          break;
        case 3: // Campaigns
          // Add timeout to prevent freezing
          await new Promise(resolve => setTimeout(resolve, 100));
          setData(prev => ({
            ...prev,
            campaigns: [
              {
                id: 1,
                name: 'Spring Enrollment',
                budget: 15000,
                spent: 8500,
                leads: 45,
                status: 'active'
              },
              {
                id: 2,
                name: 'Summer Programs',
                budget: 12000,
                spent: 5200,
                leads: 28,
                status: 'active'
              }
            ]
          }));
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error loading finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            children
          )}
        </Box>
      )}
    </div>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Finance Management
        </Typography>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Invoices" icon={<Receipt />} />
            <Tab label="Payments" icon={<Payment />} />
            <Tab label="Budgets" icon={<AccountBalance />} />
            <Tab label="Campaigns" icon={<Campaign />} />
            <Tab label="Reports" icon={<TrendingUp />} />
          </Tabs>
        </Box>

        {/* Invoices Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Invoice Management</Typography>
            <RoleGuard allowedRoles={['admin', 'finance_staff']}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog('invoice')}
                sx={{ textTransform: 'none' }}
              >
                Create Invoice
              </Button>
            </RoleGuard>
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.studentName}</TableCell>
                    <TableCell align="right">${invoice.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={invoice.status}
                        color={getStatusColor(invoice.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                      <RoleGuard allowedRoles={['admin', 'finance_staff']}>
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                      </RoleGuard>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Payments Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Payment Records</Typography>
            <RoleGuard allowedRoles={['admin', 'finance_staff']}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog('payment')}
                sx={{ textTransform: 'none' }}
              >
                Record Payment
              </Button>
            </RoleGuard>
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.studentName}</TableCell>
                    <TableCell align="right">${payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={payment.status}
                        color={getStatusColor(payment.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Budgets Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Budget Management</Typography>
            <RoleGuard allowedRoles={['admin', 'finance_staff']}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog('budget')}
                sx={{ textTransform: 'none' }}
              >
                Create Budget
              </Button>
            </RoleGuard>
          </Box>
          
          <Grid container spacing={2}>
            {data.budgets.map((budget) => (
              <Grid item xs={12} md={6} lg={4} key={budget.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {budget.name}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      {budget.category}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Allocated:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          ${budget.allocated.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Spent:</Typography>
                        <Typography variant="body2" color="error">
                          ${budget.spent.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Remaining:</Typography>
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                          ${budget.remaining.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Campaigns Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Marketing Campaigns</Typography>
            <RoleGuard allowedRoles={['admin', 'marketing_staff']}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog('campaign')}
                sx={{ textTransform: 'none' }}
              >
                Create Campaign
              </Button>
            </RoleGuard>
          </Box>
          
          <Grid container spacing={2}>
            {data.campaigns.map((campaign) => (
              <Grid item xs={12} md={6} key={campaign.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6">
                        {campaign.name}
                      </Typography>
                      <Chip
                        label={campaign.status}
                        color={getStatusColor(campaign.status)}
                        size="small"
                      />
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Budget
                        </Typography>
                        <Typography variant="h6">
                          ${campaign.budget.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Spent
                        </Typography>
                        <Typography variant="h6" color="error">
                          ${campaign.spent.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Leads Generated
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {campaign.leads}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Cost per Lead
                        </Typography>
                        <Typography variant="h6">
                          ${(campaign.spent / campaign.leads).toFixed(0)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Reports Tab */}
        <TabPanel value={activeTab} index={4}>
          <Typography variant="h6" gutterBottom>
            Financial Reports & Analytics
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    125,000 FCFA
                  </Typography>
                  <Typography color="text.secondary">
                    Total Revenue (YTD)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                    85,000 FCFA
                  </Typography>
                  <Typography color="text.secondary">
                    Collected Payments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                    40,000 FCFA
                  </Typography>
                  <Typography color="text.secondary">
                    Outstanding Balance
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Generic Dialog for Forms */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'invoice' && 'Create New Invoice'}
          {dialogType === 'payment' && 'Record Payment'}
          {dialogType === 'budget' && 'Create Budget'}
          {dialogType === 'campaign' && 'Create Campaign'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Form implementation in progress. This dialog prevents UI freezing by properly handling state.
          </Alert>
          <TextField
            fullWidth
            label="Title/Name"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Amount/Budget"
            type="number"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinanceModule;
