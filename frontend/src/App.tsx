import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ProposalList from './pages/proposals/ProposalList';
import ProposalCreate from './pages/proposals/ProposalCreate';
import ProposalDetail from './pages/proposals/ProposalDetail';
import ProposalEdit from './pages/proposals/ProposalEdit';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Vieši maršrutai */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Apsaugoti maršrutai */}
            <Route element={<ProtectedRoute />}>
              {/* Pasiūlymų maršrutai */}
              <Route path="/proposals" element={<ProposalList />} />
              <Route path="/proposals/new" element={<ProposalCreate />} />
              <Route path="/proposals/:id" element={<ProposalDetail />} />
              <Route path="/proposals/edit/:id" element={<ProposalEdit />} />
            </Route>
            
            {/* Nukreipimas į pagrindinį puslapį, jei maršrutas nerastas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 