import React, { useState } from 'react';
import {
  Box,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import ChatButton from '../Chat/ChatButton';
import WhiteSidebar from './WhiteSidebar';
import WhiteTopbar from './WhiteTopbar';

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* White Topbar */}
      <WhiteTopbar onMenuClick={handleDrawerToggle} isMobile={isMobile} />

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{
          width: { md: 280 },
          flexShrink: { md: 0 },
          zIndex: theme.zIndex.drawer,
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
              border: 'none',
            },
          }}
        >
          <WhiteSidebar
            open={mobileOpen}
            onClose={handleDrawerClose}
            isMobile={true}
          />
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
              border: 'none',
            },
          }}
          open
        >
          <WhiteSidebar
            open={true}
            onClose={handleDrawerClose}
            isMobile={false}
          />
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - 280px)` },
          mt: '70px', // Height of the white topbar
          minHeight: 'calc(100vh - 70px)',
          position: 'relative',
        }}
      >
        {children}
      </Box>

      {/* Community Chat Button */}
      <ChatButton />
    </Box>
  );
};

export default Layout;
