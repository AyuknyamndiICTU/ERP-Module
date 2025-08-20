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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Computer as ComputerIcon,
  Chair as FurnitureIcon,
  Build as ToolIcon,
  DirectionsCar as VehicleIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignIcon,
  AssignmentReturn as ReturnIcon,
} from '@mui/icons-material';
import { useApiData, useDialogState } from '../../hooks/useApiData';
import { FormDialog, ConfirmDialog, DetailDialog } from '../../components/Common/DialogComponents';
import GlassCard from '../../components/GlassCard';
import logger from '../../utils/logger';

const AssetsPage = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Mock API service for assets
  const mockAssetService = {
    getAll: async () => ({
      data: {
        success: true,
        data: [
          {
            id: 1,
            assetId: 'AST001',
            name: 'Dell Laptop XPS 13',
            category: 'IT Equipment',
            type: 'Laptop',
            serialNumber: 'DL123456789',
            purchaseDate: '2023-01-15',
            purchasePrice: 1200,
            currentValue: 800,
            status: 'assigned',
            assignedTo: 'John Smith (EMP001)',
            location: 'Computer Science Dept',
            condition: 'good',
            warrantyExpiry: '2026-01-15',
            vendor: 'Dell Technologies'
          },
          {
            id: 2,
            assetId: 'AST002',
            name: 'Office Chair Ergonomic',
            category: 'Furniture',
            type: 'Chair',
            serialNumber: 'OC987654321',
            purchaseDate: '2022-06-10',
            purchasePrice: 350,
            currentValue: 200,
            status: 'available',
            assignedTo: null,
            location: 'Storage Room A',
            condition: 'excellent',
            warrantyExpiry: '2025-06-10',
            vendor: 'Office Furniture Co.'
          },
          {
            id: 3,
            assetId: 'AST003',
            name: 'Projector Epson EB-X41',
            category: 'AV Equipment',
            type: 'Projector',
            serialNumber: 'EP456789123',
            purchaseDate: '2023-03-20',
            purchasePrice: 600,
            currentValue: 450,
            status: 'maintenance',
            assignedTo: null,
            location: 'IT Service Center',
            condition: 'fair',
            warrantyExpiry: '2026-03-20',
            vendor: 'Epson Inc.'
          },
          {
            id: 4,
            assetId: 'AST004',
            name: 'Toyota Camry 2022',
            category: 'Vehicle',
            type: 'Sedan',
            serialNumber: 'TC789123456',
            purchaseDate: '2022-01-01',
            purchasePrice: 25000,
            currentValue: 20000,
            status: 'assigned',
            assignedTo: 'Sarah Johnson (EMP002)',
            location: 'Parking Lot B',
            condition: 'excellent',
            warrantyExpiry: '2025-01-01',
            vendor: 'Toyota Motors'
          }
        ]
      }
    }),
    create: async (data) => ({
      data: {
        success: true,
        data: { id: Date.now(), ...data, assetId: `AST${String(Date.now()).slice(-3)}` }
      }
    }),
    update: async (id, data) => ({ data: { success: true, data: { id, ...data } } }),
    delete: async (id) => ({ data: { success: true } }),
    getById: async (id) => ({ data: { success: true, data: {} } })
  };

  const { data: assets, loading, createItem, updateItem, deleteItem, handleSearch } = useApiData(mockAssetService);
  const { dialogs, selectedItem, openDialog, closeDialog } = useDialogState();

  const assetFields = [
    { name: 'name', label: 'Asset Name', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'select', required: true, options: [
      { value: 'IT Equipment', label: 'IT Equipment' },
      { value: 'Furniture', label: 'Furniture' },
      { value: 'AV Equipment', label: 'AV Equipment' },
      { value: 'Vehicle', label: 'Vehicle' },
      { value: 'Tools', label: 'Tools' },
      { value: 'Office Supplies', label: 'Office Supplies' }
    ]},
    { name: 'type', label: 'Type', type: 'text', required: true },
    { name: 'serialNumber', label: 'Serial Number', type: 'text', required: true },
    { name: 'purchaseDate', label: 'Purchase Date', type: 'date', required: true, width: 6 },
    { name: 'purchasePrice', label: 'Purchase Price ($)', type: 'number', required: true, min: 0, width: 6 },
    { name: 'vendor', label: 'Vendor', type: 'text', required: true },
    { name: 'location', label: 'Location', type: 'text', required: true },
    { name: 'warrantyExpiry', label: 'Warranty Expiry', type: 'date' },
    { name: 'condition', label: 'Condition', type: 'select', options: [
      { value: 'excellent', label: 'Excellent' },
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' },
      { value: 'poor', label: 'Poor' }
    ]}
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'assigned': return 'info';
      case 'maintenance': return 'warning';
      case 'retired': return 'error';
      default: return 'default';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'fair': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'IT Equipment': return <ComputerIcon />;
      case 'Furniture': return <FurnitureIcon />;
      case 'Vehicle': return <VehicleIcon />;
      case 'Tools': return <ToolIcon />;
      default: return <ComputerIcon />;
    }
  };

  const handleMenuClick = (event, asset) => {
    setAnchorEl(event.currentTarget);
    setSelectedAsset(asset);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAsset(null);
  };

  const handleCreateAsset = async (data) => {
    try {
      await createItem({
        ...data,
        status: 'available',
        currentValue: data.purchasePrice
      });
      closeDialog('create');
    } catch (error) {
      logger.error('Error creating asset:', error);
    }
  };

  const handleUpdateAsset = async (data) => {
    try {
      await updateItem(selectedItem.id, data);
      closeDialog('edit');
    } catch (error) {
      logger.error('Error updating asset:', error);
    }
  };

  const handleDeleteAsset = async () => {
    try {
      await deleteItem(selectedItem.id);
      closeDialog('delete');
    } catch (error) {
      logger.error('Error deleting asset:', error);
    }
  };

  const handleAssignAsset = (asset) => {
    // This would open an assignment dialog
    logger.debug('Assign asset:', asset);
    handleMenuClose();
  };

  const handleReturnAsset = (asset) => {
    updateItem(asset.id, {
      ...asset,
      status: 'available',
      assignedTo: null
    });
    handleMenuClose();
  };

  // Filter assets based on tab
  const getFilteredAssets = () => {
    switch (tabValue) {
      case 0: return assets; // All
      case 1: return assets.filter(asset => asset.status === 'available');
      case 2: return assets.filter(asset => asset.status === 'assigned');
      case 3: return assets.filter(asset => asset.status === 'maintenance');
      default: return assets;
    }
  };

  // Calculate summary statistics
  const totalAssets = assets.length;
  const availableAssets = assets.filter(asset => asset.status === 'available').length;
  const assignedAssets = assets.filter(asset => asset.status === 'assigned').length;
  const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="700">
          Asset Management
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
          Add Asset
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Assets
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {totalAssets}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="success.main" gutterBottom>
                Available
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {availableAssets}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="info.main" gutterBottom>
                Assigned
              </Typography>
              <Typography variant="h4" fontWeight="700">
                {assignedAssets}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Value
              </Typography>
              <Typography variant="h4" fontWeight="700">
                ${totalValue.toLocaleString()}
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <GlassCard sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search assets..."
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

      {/* Assets Table */}
      <GlassCard>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ px: 3, pt: 2 }}>
          <Tab label="All Assets" />
          <Tab label="Available" />
          <Tab label="Assigned" />
          <Tab label="Maintenance" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Asset</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Value</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredAssets().map((asset) => (
                <TableRow key={asset.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                        {getCategoryIcon(asset.category)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {asset.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {asset.assetId} • {asset.type}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="500">
                      {asset.category}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {asset.serialNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Chip
                        label={asset.status.toUpperCase()}
                        color={getStatusColor(asset.status)}
                        size="small"
                        sx={{ mb: 0.5 }}
                      />
                      <br />
                      <Chip
                        label={asset.condition.toUpperCase()}
                        color={getConditionColor(asset.condition)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {asset.assignedTo || 'Not Assigned'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {asset.location}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      ${asset.currentValue.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Purchase: ${asset.purchasePrice.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, asset)}
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
        <MenuItem onClick={() => { openDialog('detail', selectedAsset); handleMenuClose(); }}>
          <ViewIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={() => { openDialog('edit', selectedAsset); handleMenuClose(); }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Asset
        </MenuItem>
        {selectedAsset?.status === 'available' && (
          <MenuItem onClick={() => handleAssignAsset(selectedAsset)}>
            <AssignIcon sx={{ mr: 1 }} fontSize="small" />
            Assign Asset
          </MenuItem>
        )}
        {selectedAsset?.status === 'assigned' && (
          <MenuItem onClick={() => handleReturnAsset(selectedAsset)}>
            <ReturnIcon sx={{ mr: 1 }} fontSize="small" />
            Return Asset
          </MenuItem>
        )}
        <MenuItem onClick={() => { openDialog('delete', selectedAsset); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Asset
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <FormDialog
        open={dialogs.create}
        onClose={() => closeDialog('create')}
        title="Add New Asset"
        fields={assetFields}
        onSave={handleCreateAsset}
        loading={loading}
      />

      <FormDialog
        open={dialogs.edit}
        onClose={() => closeDialog('edit')}
        title="Edit Asset"
        fields={assetFields}
        data={selectedItem}
        onSave={handleUpdateAsset}
        loading={loading}
      />

      <DetailDialog
        open={dialogs.detail}
        onClose={() => closeDialog('detail')}
        title="Asset Details"
        data={selectedItem}
        fields={[
          { name: 'assetId', label: 'Asset ID' },
          { name: 'name', label: 'Asset Name' },
          { name: 'category', label: 'Category' },
          { name: 'type', label: 'Type' },
          { name: 'serialNumber', label: 'Serial Number' },
          { name: 'purchaseDate', label: 'Purchase Date' },
          { name: 'purchasePrice', label: 'Purchase Price', render: (value) => `$${value?.toLocaleString()}` },
          { name: 'currentValue', label: 'Current Value', render: (value) => `$${value?.toLocaleString()}` },
          { name: 'vendor', label: 'Vendor' },
          { name: 'location', label: 'Location' },
          { name: 'warrantyExpiry', label: 'Warranty Expiry' },
          { name: 'status', label: 'Status', render: (value) => (
            <Chip label={value?.toUpperCase()} color={getStatusColor(value)} size="small" />
          )},
          { name: 'condition', label: 'Condition', render: (value) => (
            <Chip label={value?.toUpperCase()} color={getConditionColor(value)} size="small" />
          )},
          { name: 'assignedTo', label: 'Assigned To', width: 12 }
        ]}
        actions={[
          {
            label: 'Edit',
            onClick: () => { closeDialog('detail'); openDialog('edit', selectedItem); },
            icon: <EditIcon />,
            variant: 'outlined'
          },
          ...(selectedItem?.status === 'available' ? [{
            label: 'Assign Asset',
            onClick: () => { handleAssignAsset(selectedItem); closeDialog('detail'); },
            icon: <AssignIcon />,
            variant: 'contained'
          }] : []),
          ...(selectedItem?.status === 'assigned' ? [{
            label: 'Return Asset',
            onClick: () => { handleReturnAsset(selectedItem); closeDialog('detail'); },
            icon: <ReturnIcon />,
            variant: 'contained',
            color: 'warning'
          }] : [])
        ]}
      />

      <ConfirmDialog
        open={dialogs.delete}
        onClose={() => closeDialog('delete')}
        onConfirm={handleDeleteAsset}
        title="Delete Asset"
        message={`Are you sure you want to delete the asset "${selectedItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        severity="error"
        loading={loading}
      />
    </Box>
  );
};

export default AssetsPage;
