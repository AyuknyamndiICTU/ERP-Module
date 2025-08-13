import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const ProfilePage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Profile management functionality will be implemented here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
