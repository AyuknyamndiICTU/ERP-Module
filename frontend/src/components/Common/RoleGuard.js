import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { Lock } from '@mui/icons-material';

const RoleGuard = ({ 
  children, 
  allowedRoles = [], 
  fallback = null, 
  showDialog = true,
  onUnauthorized = null 
}) => {
  const { user } = useAuth();
  const [showAccessDenied, setShowAccessDenied] = React.useState(false);

  const hasAccess = () => {
    if (!user) return false;
    if (allowedRoles.length === 0) return true;
    return allowedRoles.includes(user.role);
  };

  const handleUnauthorizedAccess = () => {
    if (onUnauthorized) {
      onUnauthorized();
    } else if (showDialog) {
      setShowAccessDenied(true);
    }
  };

  if (!hasAccess()) {
    if (fallback) {
      return fallback;
    }
    
    return (
      <>
        <div onClick={handleUnauthorizedAccess} style={{ cursor: 'pointer' }}>
          {children}
        </div>
        
        <Dialog 
          open={showAccessDenied} 
          onClose={() => setShowAccessDenied(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lock color="error" />
            Access Restricted
          </DialogTitle>
          <DialogContent>
            <Typography>
              You do not have permission to access this feature. 
              This action is restricted to: {allowedRoles.join(', ')}.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Your current role: {user?.role || 'Unknown'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAccessDenied(false)} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return children;
};

export default RoleGuard;
