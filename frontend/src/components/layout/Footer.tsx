import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Divider />
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} SocioDecisionMakingApp - Sociokratinė sprendimų priėmimo aplikacija
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Sukurta naudojant React, Material-UI ir MongoDB
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 