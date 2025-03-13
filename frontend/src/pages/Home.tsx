import React from 'react';
import { Container, Typography, Box, Button, Paper, Grid, Card, CardContent, CardActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Description as DescriptionIcon, Group as GroupIcon, HowToVote as HowToVoteIcon } from '@mui/icons-material';

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleLogoutClick = () => {
    logout();
  };

  const handleProposalsClick = () => {
    navigate('/proposals');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Sociokratinė sprendimų priėmimo aplikacija
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Platforma, skirta pasiūlymų valdymui, diskusijoms ir sprendimų priėmimui sociokratiniais principais
        </Typography>

        <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
          {user ? (
            <Box>
              <Typography variant="h5" gutterBottom>
                Sveiki, {user.name}
              </Typography>
              <Typography variant="body1" paragraph>
                Jūs esate prisijungę kaip {user.role === 'admin' ? 'administratorius' : 'vartotojas'}
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleProposalsClick}
                >
                  Peržiūrėti pasiūlymus
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={handleLogoutClick}
                >
                  Atsijungti
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="h5" gutterBottom>
                Sveiki atvykę!
              </Typography>
              <Typography variant="body1" paragraph>
                Prisijunkite arba užsiregistruokite, kad galėtumėte naudotis visomis sistemos funkcijomis.
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="contained" color="primary" onClick={handleLoginClick}>
                  Prisijungti
                </Button>
                <Button variant="outlined" color="primary" onClick={handleRegisterClick}>
                  Registruotis
                </Button>
              </Box>
            </Box>
          )}
        </Paper>

        {/* Funkcijų kortelės */}
        {user && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <DescriptionIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                  <Typography variant="h5" component="div" gutterBottom>
                    Pasiūlymai
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Kurkite ir valdykite pasiūlymus, sekite jų būsenas nuo juodraščio iki įgyvendinimo.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button size="small" onClick={() => navigate('/proposals/new')}>
                    Sukurti naują pasiūlymą
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <GroupIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                  <Typography variant="h5" component="div" gutterBottom>
                    Bendradarbiavimas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Diskutuokite apie pasiūlymus, komentuokite ir bendradarbiaukite su komandos nariais.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button size="small" onClick={() => navigate('/proposals')}>
                    Peržiūrėti diskusijas
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <HowToVoteIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                  <Typography variant="h5" component="div" gutterBottom>
                    Balsavimas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Balsuokite už pasiūlymus sociokratiniu metodu, kur sprendimai priimami bendru sutarimu.
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button size="small" onClick={() => navigate('/proposals?status=voting')}>
                    Peržiūrėti balsavimus
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Apie projektą
          </Typography>
          <Typography variant="body1" paragraph align="left">
            Sociokratinė sprendimų priėmimo aplikacija padeda organizacijoms priimti sprendimus 
            sociokratiniais principais. Platforma leidžia kurti, redaguoti ir aptarti pasiūlymus, 
            o sprendimai priimami ne daugumos balsavimu, bet bendru sutarimu.
          </Typography>
          <Typography variant="body1" paragraph align="left">
            Sociokratijoje sprendimai priimami tik tada, kai nėra rimtų ir argumentuotų prieštaravimų. 
            Tai skatina gilesnį dialogą, geresnius sprendimus ir didesnį įsitraukimą.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage; 