import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Box,
  Chip,
  Avatar,
  CircularProgress,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Circle as CircleIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { lt } from 'date-fns/locale';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// Pasiūlymo sąsaja
interface Proposal {
  _id: string;
  title: string;
  description: string;
  circle: string;
  status: string;
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  facilitator: {
    _id: string;
    name: string;
    email: string;
  };
  participants: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  comments: number;
  votes: number;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
}

// Funkcija statuso vertimui į lietuvių kalbą
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'draft': 'Juodraštis',
    'discussion': 'Aptarimas',
    'voting': 'Balsavimas',
    'accepted': 'Priimtas',
    'rejected': 'Atmestas',
    'implemented': 'Įgyvendintas'
  };
  return statusMap[status] || status;
};

// Funkcija statuso spalvos nustatymui
const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'draft': '#888888',
    'discussion': '#2196f3',
    'voting': '#f57c00',
    'accepted': '#4caf50',
    'rejected': '#f44336',
    'implemented': '#9c27b0'
  };
  return colorMap[status] || '#000000';
};

// Funkcija datos formatavimui
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'yyyy-MM-dd', { locale: lt });
};

// Aprašymo sutrumpinimas
const truncateDescription = (description: string, maxLength: number = 150): string => {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength) + '...';
};

const ProposalList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Būsenos
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtrai
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [circleFilter, setCircleFilter] = useState<string>('all');
  const [tabValue, setTabValue] = useState<number>(0);
  
  // Unikalių ratų sąrašas
  const [circles, setCircles] = useState<string[]>([]);
  
  // Pasiūlymų gavimas
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/proposals');
        const fetchedProposals = response.data.data;
        
        setProposals(fetchedProposals);
        setFilteredProposals(fetchedProposals);
        
        // Išgauti unikalius ratus
        const uniqueCircles = Array.from(
          new Set(fetchedProposals.map((proposal: Proposal) => proposal.circle))
        );
        setCircles(uniqueCircles as string[]);
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching proposals:', err);
        setError(err.response?.data?.message || 'Nepavyko gauti pasiūlymų sąrašo');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProposals();
  }, []);
  
  // Filtrų taikymas
  useEffect(() => {
    let result = [...proposals];
    
    // Paieškos filtras
    if (searchTerm) {
      result = result.filter(
        proposal => 
          proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proposal.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Statuso filtras
    if (statusFilter !== 'all') {
      result = result.filter(proposal => proposal.status === statusFilter);
    }
    
    // Rato filtras
    if (circleFilter !== 'all') {
      result = result.filter(proposal => proposal.circle === circleFilter);
    }
    
    // Tabo filtras
    if (tabValue === 1 && user) {
      // Mano pasiūlymai
      result = result.filter(proposal => proposal.creator._id === user._id);
    } else if (tabValue === 2 && user) {
      // Pasiūlymai, kuriuose dalyvauju
      result = result.filter(
        proposal => proposal.participants.some(p => p._id === user._id)
      );
    }
    
    setFilteredProposals(result);
  }, [searchTerm, statusFilter, circleFilter, tabValue, proposals, user]);
  
  // Filtrų valymas
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCircleFilter('all');
  };
  
  // Tabų keitimas
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Statuso filtro keitimas
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };
  
  // Rato filtro keitimas
  const handleCircleFilterChange = (event: SelectChangeEvent) => {
    setCircleFilter(event.target.value);
  };
  
  // Nukreipimas į naujo pasiūlymo kūrimo puslapį
  const handleCreateProposal = () => {
    navigate('/proposals/new');
  };
  
  // Nukreipimas į pasiūlymo detalių puslapį
  const handleViewProposal = (id: string) => {
    navigate(`/proposals/${id}`);
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Pasiūlymai
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateProposal}
        >
          Naujas pasiūlymas
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Visi pasiūlymai" />
          <Tab label="Mano sukurti" />
          <Tab label="Dalyvauju" />
        </Tabs>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Paieška"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Statusas</InputLabel>
              <Select
                value={statusFilter}
                label="Statusas"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">Visi statusai</MenuItem>
                <MenuItem value="draft">Juodraštis</MenuItem>
                <MenuItem value="discussion">Aptarimas</MenuItem>
                <MenuItem value="voting">Balsavimas</MenuItem>
                <MenuItem value="accepted">Priimtas</MenuItem>
                <MenuItem value="rejected">Atmestas</MenuItem>
                <MenuItem value="implemented">Įgyvendintas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Ratas</InputLabel>
              <Select
                value={circleFilter}
                label="Ratas"
                onChange={handleCircleFilterChange}
              >
                <MenuItem value="all">Visi ratai</MenuItem>
                {circles.map((circle) => (
                  <MenuItem key={circle} value={circle}>{circle}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
              disabled={!searchTerm && statusFilter === 'all' && circleFilter === 'all'}
            >
              Išvalyti
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {filteredProposals.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Pasiūlymų nerasta
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Pabandykite pakeisti paieškos kriterijus arba sukurkite naują pasiūlymą.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateProposal}
            sx={{ mt: 3 }}
          >
            Sukurti naują pasiūlymą
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredProposals.map((proposal) => (
            <Grid item xs={12} sm={6} md={4} key={proposal._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip 
                      label={getStatusText(proposal.status)} 
                      size="small"
                      sx={{ 
                        bgcolor: getStatusColor(proposal.status),
                        color: 'white',
                        fontWeight: 'bold',
                        mb: 1
                      }} 
                    />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(proposal.createdAt)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" component="div" gutterBottom>
                    {proposal.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    paragraph
                    sx={{ 
                      minHeight: '60px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {truncateDescription(proposal.description)}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CircleIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {proposal.circle}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: 'secondary.main' }} />
                      <Typography variant="body2">
                        {proposal.creator.name}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => handleViewProposal(proposal._id)}
                    fullWidth
                  >
                    Peržiūrėti
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProposalList; 