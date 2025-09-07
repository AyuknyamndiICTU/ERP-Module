import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

const ResponsiveLayout = ({ children, sidebar, header }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      {sidebar && (
        <Box
          sx={{
            width: {
              xs: 0,
              sm: 240,
              md: 280,
              lg: 300
            },
            flexShrink: 0,
            display: {
              xs: 'none',
              sm: 'block'
            },
            '& .MuiDrawer-paper': {
              width: {
                xs: 0,
                sm: 240,
                md: 280,
                lg: 300
              },
              boxSizing: 'border-box',
            },
          }}
        >
          {sidebar}
        </Box>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: {
            xs: '100%',
            sm: sidebar ? 'calc(100% - 240px)' : '100%',
            md: sidebar ? 'calc(100% - 280px)' : '100%',
            lg: sidebar ? 'calc(100% - 300px)' : '100%'
          }
        }}
      >
        {/* Header */}
        {header && (
          <Box
            sx={{
              height: {
                xs: 56,
                sm: 64
              },
              flexShrink: 0
            }}
          >
            {header}
          </Box>
        )}

        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            p: {
              xs: 1,
              sm: 2,
              md: 3
            },
            overflow: 'auto'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default ResponsiveLayout;
