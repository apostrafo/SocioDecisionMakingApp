import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
  const { user, loading } = useAuth();

  // Jei vis dar kraunasi
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Jei nėra prisijungęs, nukreipti į prisijungimo puslapį
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Jei reikia admin teisių, bet vartotojas ne admin
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  // Jei vartotojas prisijungęs ir turi reikiamas teises, rodyti komponentą
  return <Outlet />;
};

export default ProtectedRoute; 