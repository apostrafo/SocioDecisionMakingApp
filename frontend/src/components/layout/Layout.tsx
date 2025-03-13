import React, { ReactNode } from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: isMobile ? 2 : 3,
          mt: 8, // Vieta navigacijos juostai
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout; 