import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Avatar,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  FormHelperText,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { lt } from 'date-fns/locale';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const ProposalCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Formos būsenos
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [circle, setCircle] = useState<string>('');
  const [participants, setParticipants] = useState<User[]>([]);
  const [facilitator, setFacilitator] = useState<User | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);

  // Kitos būsenos
  const [circles, setCircles] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Pradinių duomenų užkrovimas
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Gauti visus vartotojus
        const usersResponse = await api.get('/api/users');
        setAvailableUsers(usersResponse.data || []);
        
        // Gauti unikalius ratus
        const proposalsResponse = await api.get('/api/proposals');
        const uniqueCircles = Array.from(
          new Set((proposalsResponse.data.data || []).map((p: any) => p.circle))
        );
        setCircles(uniqueCircles as string[]);
        
        // Jei esamas vartotojas, pridėti jį kaip dalyvį
        if (user) {
          setParticipants([user]);
        }
      } catch (err: any) {
        console.error('Error fetching initial data:', err);
        setError('Nepavyko užkrauti reikalingų duomenų');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [user]);
  
  // Formos validavimas
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Pavadinimas yra privalomas';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Aprašymas yra privalomas';
    }
    
    if (!circle.trim()) {
      newErrors.circle = 'Ratas yra privalomas';
    }
    
    if (participants.length === 0) {
      newErrors.participants = 'Bent vienas dalyvis yra privalomas';
    }
    
    if (!facilitator) {
      newErrors.facilitator = 'Fasilitatorius yra privalomas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Pasiūlymo išsaugojimas
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newProposal = {
        title,
        description,
        circle,
        participants: participants.map(p => p._id),
        facilitator: facilitator?._id,
        deadline: deadline ? deadline.toISOString() : undefined
      };
      
      const response = await api.post('/api/proposals', newProposal);
      
      navigate(`/proposals/${response.data.data._id}`);
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      setError(err.response?.data?.message || 'Nepavyko sukurti pasiūlymo');
    } finally {
      setLoading(false);
    }
  };
  
  // Dalyvio pridėjimas/pašalinimas
  const handleParticipantToggle = (user: User) => {
    const isParticipant = participants.some(p => p._id === user._id);
    
    if (isParticipant) {
      // Pašalinti dalyvį
      setParticipants(participants.filter(p => p._id !== user._id));
      
      // Jei šalinamas dalyvis buvo fasilitatorius, nustatyti fasilitatorių į null
      if (facilitator && facilitator._id === user._id) {
        setFacilitator(null);
      }
    } else {
      // Pridėti dalyvį
      setParticipants([...participants, user]);
    }
  };
  
  // Grįžimas atgal
  const handleBack = () => {
    navigate('/proposals');
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Grįžti į sąrašą
        </Button>
      </Box>
      
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Naujas pasiūlymas
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Pavadinimas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Aprašymas"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={6}
                error={!!errors.description}
                helperText={errors.description}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.circle}>
                <Autocomplete
                  freeSolo
                  options={circles}
                  value={circle}
                  onChange={(_, newValue) => setCircle(newValue || '')}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Ratas" 
                      required
                      error={!!errors.circle}
                      helperText={errors.circle}
                      onChange={(e) => setCircle(e.target.value)}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={lt}>
                <DatePicker
                  label="Terminas (neprivaloma)"
                  value={deadline}
                  onChange={(newValue) => setDeadline(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Dalyviai
              </Typography>
              
              <FormControl fullWidth error={!!errors.participants}>
                <FormHelperText>{errors.participants}</FormHelperText>
                
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {participants.length > 0 ? (
                      participants.map((participant) => (
                        <Chip
                          key={participant._id}
                          avatar={<Avatar>{participant.name.charAt(0)}</Avatar>}
                          label={participant.name}
                          onDelete={() => handleParticipantToggle(participant)}
                          color="primary"
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nepasirinkti dalyviai. Pridėkite bent vieną dalyvį.
                      </Typography>
                    )}
                  </Box>
                </Paper>
                
                <Typography variant="subtitle2" gutterBottom>
                  Pridėti / pašalinti dalyvius:
                </Typography>
                
                <Box sx={{ maxHeight: '200px', overflow: 'auto', mb: 3 }}>
                  <Stack spacing={1}>
                    {availableUsers.map((availableUser) => {
                      const isParticipant = participants.some(
                        (p) => p._id === availableUser._id
                      );
                      
                      return (
                        <Paper 
                          variant="outlined" 
                          key={availableUser._id}
                          sx={{ 
                            p: 1, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            bgcolor: isParticipant ? 'action.selected' : 'inherit'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1 }}>
                              {availableUser.name.charAt(0)}
                            </Avatar>
                            <div>
                              <Typography variant="body1">
                                {availableUser.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {availableUser.email}
                              </Typography>
                            </div>
                          </Box>
                          
                          <Button
                            size="small"
                            variant={isParticipant ? "outlined" : "contained"}
                            color={isParticipant ? "error" : "primary"}
                            startIcon={isParticipant ? <RemoveIcon /> : <AddIcon />}
                            onClick={() => handleParticipantToggle(availableUser)}
                          >
                            {isParticipant ? "Pašalinti" : "Pridėti"}
                          </Button>
                        </Paper>
                      );
                    })}
                  </Stack>
                </Box>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.facilitator}>
                <InputLabel id="facilitator-label">Fasilitatorius</InputLabel>
                <Select
                  labelId="facilitator-label"
                  label="Fasilitatorius"
                  value={facilitator?._id || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedUser = availableUsers.find(p => p._id === selectedId);
                    
                    // Jei pasirinktas vartotojas nėra tarp dalyvių, automatiškai pridėti jį
                    if (selectedUser && !participants.some(p => p._id === selectedUser._id)) {
                      setParticipants([...participants, selectedUser]);
                    }
                    
                    setFacilitator(selectedUser || null);
                  }}
                  renderValue={(selected) => {
                    const selectedUser = availableUsers.find(p => p._id === selected);
                    if (!selectedUser) return '';
                    
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1 }}>
                          {selectedUser.name.charAt(0)}
                        </Avatar>
                        <Typography>{selectedUser.name}</Typography>
                      </Box>
                    );
                  }}
                >
                  {availableUsers.map((availableUser) => (
                    <MenuItem key={availableUser._id} value={availableUser._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1 }}>
                          {availableUser.name.charAt(0)}
                        </Avatar>
                        <Typography>{availableUser.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.facilitator}</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleBack}
                  sx={{ mr: 2 }}
                >
                  Atšaukti
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Išsaugoti pasiūlymą'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ProposalCreate; 