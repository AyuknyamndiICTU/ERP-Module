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
  Computer as ComputerIcon,
  Phone as PhoneIcon,
  Chair as FurnitureIcon,
  Build as ToolIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Assignment as AssignIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import FormDialog from '../../components/Common/FormDialog';

const AssetsPage = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Mock data
  const mockAssets = [
    {
      id: 1,
      assetId: 'AST001',
      name: 'Dell Laptop OptiPlex 7090',
      category: 'Computer',
      serialNumber: 'DL7090-001',
      purchaseDate: '2023-01-15',
      purchasePrice: 1200.00,
      currentValue: 800.00,
      status: 'assigned',
      assignedTo: 'John Doe (EMP001)',
      location: 'Computer Science Lab',
      condition: 'good'
    },
    {
      id: 2,
      assetId: 'AST002',
      name: 'iPhone 14 Pro',
      category: 'Mobile Device',
      serialNumber: 'IP14P-002',
      purchaseDate: '2023-03-20',
      purchasePrice: 999.00,
      currentValue: 750.00,
      status: 'available',
      assignedTo: null,
      location: 'IT Storage',
      condition: 'excellent'
    },
    {
      id: 3,
      assetId: 'AST003',
      name: 'Office Chair Ergonomic',
      category: 'Furniture',
      serialNumber: 'OC-ERG-003',
      purchaseDate: '2022-08-10',
      purchasePrice: 350.00,
      currentValue: 200.00,
      status: 'assigned',
      assignedTo: 'Jane Smith (EMP002)',
      location: 'Mathematics Department',
      condition: 'good'
    },
    {
      id: 4,
      assetId: 'AST004',
      name: 'Projector Epson EB-X41',
      category: 'Equipment',
      serialNumber: 'EP-EBX41-004',
      purchaseDate: '2023-06-05',
      purchasePrice: 450.00,
      currentValue: 380.00,
      status: 'maintenance',
      assignedTo: null,
      location: 'Maintenance Room',
      condition: 'needs_repair'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAssets(mockAssets);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'assigned': return 'info';
      case 'maintenance': return 'warning';
      case 'disposed': return 'error';
      default: return 'default';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'fair': return 'warning';
      case 'needs_repair': return 'error';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Computer': return <ComputerIcon />;
      case 'Mobile Device': return <PhoneIcon />;
      case 'Furniture': return <FurnitureIcon />;
      case 'Equipment': return <ToolIcon />;
      default: return <ToolIcon />;
    }
  };

  const handleAddAsset = (formData) => {
    const newAsset = {
      id: assets.length + 1,
      assetId: `AST${String(assets.length + 1).padStart(3, '0')}`,
      name: formData.name,
      category: formData.category,
      serialNumber: formData.serialNumber,
      purchaseDate: formData.purchaseDate,
      purchasePrice: parseFloat(formData.purchasePrice),
      currentValue: parseFloat(formData.currentValue || formData.purchasePrice),
      status: 'available',
      assignedTo: null,
      location: formData.location,
      condition: 'excellent'
    };
    
    setAssets([...assets, newAsset]);
    setShowAddDialog(false);
  };

  const assetFields = [
    { name: 'name', label: 'Asset Name', type: 'text', required: true },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { value: 'Computer', label: 'Computer' },
        { value: 'Mobile Device', label: 'Mobile Device' },
        { value: 'Furniture', label: 'Furniture' },
        { value: 'Equipment', label: 'Equipment' }
      ]
    },
    { name: 'serialNumber', label: 'Serial Number', type: 'text', required: true },
    { name: 'purchaseDate', label: 'Purchase Date', type: 'date', required: true },
    { name: 'purchasePrice', label: 'Purchase Price (FCFA)', type: 'number', required: true },
    { name: 'currentValue', label: 'Current Value (FCFA)', type: 'number' },
    { name: 'location', label: 'Location', type: 'text', required: true }
  ];

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.assignedTo && asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))
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
          Asset Management
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
          Add Asset
        </Button>
      </Box>

      {/* Search */}
      <GlassCard sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search assets..."
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
                    {assets.length}
                  </Typography>
                  <Typography variant="body2">Total Assets</Typography>
                </Box>
                <ToolIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {assets.filter(a => a.status === 'available').length}
                  </Typography>
                  <Typography variant="body2">Available</Typography>
                </Box>
                <ComputerIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {assets.filter(a => a.status === 'assigned').length}
                  </Typography>
                  <Typography variant="body2">Assigned</Typography>
                </Box>
                <AssignIcon sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {(assets.reduce((sum, a) => sum + a.currentValue, 0) / 1000).toFixed(0)}K FCFA
                  </Typography>
                  <Typography variant="body2">Total Value</Typography>
                </Box>
                <ToolIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assets Table */}
      <GlassCard>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Asset</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Serial Number</strong></TableCell>
                <TableCell><strong>Value</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Assigned To</strong></TableCell>
                <TableCell><strong>Condition</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {getCategoryIcon(asset.category)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {asset.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {asset.assetId} • {asset.location}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{asset.category}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {asset.serialNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="600" color="primary.main">
                        {asset.currentValue.toLocaleString()} FCFA
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Purchase: {asset.purchasePrice.toLocaleString()} FCFA
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                      color={getStatusColor(asset.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    {asset.assignedTo ? (
                      <Typography variant="body2">
                        {asset.assignedTo}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={asset.condition.replace('_', ' ').charAt(0).toUpperCase() + asset.condition.replace('_', ' ').slice(1)}
                      color={getConditionColor(asset.condition)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedAsset(asset);
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
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Asset
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <AssignIcon sx={{ mr: 1 }} />
          Assign/Unassign
        </MenuItem>
      </Menu>

      {/* Add Asset Dialog */}
      <FormDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        title="Add New Asset"
        fields={assetFields}
        onSave={handleAddAsset}
      />
    </Box>
  );
};

export default AssetsPage;
