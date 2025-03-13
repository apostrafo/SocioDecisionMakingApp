import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { user, register, loading, error } = useAuth();
  const navigate = useNavigate();

  // Jei vartotojas jau prisijungęs, nukreipti į pagrindinį puslapį
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validacija
    if (!name || !email || !password || !confirmPassword) {
      setFormError('Prašome užpildyti visus laukus');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Slaptažodžiai nesutampa');
      return;
    }

    if (password.length < 6) {
      setFormError('Slaptažodis turi būti bent 6 simbolių ilgio');
      return;
    }

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Registracija
        </Typography>

        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Vardas"
              type="text"
              fullWidth
              margin="normal"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            
            <TextField
              label="El. paštas"
              type="email"
              fullWidth
              margin="normal"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <TextField
              label="Slaptažodis"
              type="password"
              fullWidth
              margin="normal"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helperText="Slaptažodis turi būti bent 6 simbolių ilgio"
            />
            
            <TextField
              label="Pakartokite slaptažodį"
              type="password"
              fullWidth
              margin="normal"
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Registruotis'}
            </Button>
          </form>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Jau turite paskyrą?{' '}
              <Link component={RouterLink} to="/login">
                Prisijungti
              </Link>
            </Typography>
          </Box>
        </Paper>
        
        <Button
          variant="text"
          color="primary"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Grįžti į pagrindinį puslapį
        </Button>
      </Box>
    </Container>
  );
};

export default RegisterPage; 