import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  Tooltip,
  Container,
  List,
  ListItem,
  ListItemText,
  Drawer,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  HowToVote as HowToVoteIcon,
  Groups as GroupsIcon,
  Home as HomeIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Paskyros meniu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  
  // Mobiliosios navigacijos stalčius
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  
  // Paskyros meniu atidarymas
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Paskyros meniu uždarymas
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Atsijungimas
  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/');
  };
  
  // Stalčiaus atidarymas/uždarymas
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };
  
  // Navigacijos elementai
  const navItems = [
    { text: 'Pagrindinis', path: '/', icon: <HomeIcon /> },
    { text: 'Pasiūlymai', path: '/proposals', icon: <HowToVoteIcon /> },
  ];
  
  // Nuorodos paspaudimas
  const handleNavigate = (path: string) => {
    if (isMobile) {
      setDrawerOpen(false);
    }
    navigate(path);
  };
  
  // Stalčiaus turinys
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" component="div">
          SocioDecisionMakingApp
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            component={RouterLink}
            to={item.path}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {!user ? (
          <>
            <ListItem 
              button 
              component={RouterLink}
              to="/login"
              selected={location.pathname === '/login'}
            >
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Prisijungti" />
            </ListItem>
            <ListItem 
              button 
              component={RouterLink}
              to="/register"
              selected={location.pathname === '/register'}
            >
              <ListItemIcon>
                <PersonAddIcon />
              </ListItemIcon>
              <ListItemText primary="Registruotis" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText 
                primary={user.name}
                secondary={user.email}
              />
            </ListItem>
            <Divider />
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Atsijungti" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );
  
  return (
    <AppBar position="fixed">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              flexGrow: { xs: 1, md: 0 }
            }}
          >
            SocioDecisionMakingApp
          </Typography>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', flexGrow: 1, ml: 3 }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  sx={{ 
                    mx: 1,
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                    borderBottom: location.pathname === item.path ? '2px solid white' : 'none'
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}
          
          {!user ? (
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{ ml: 1 }}
              >
                Prisijungti
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/register"
                sx={{ ml: 1 }}
              >
                Registruotis
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Tooltip title="Paskyros nustatymai">
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={menuOpen ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={menuOpen ? 'true' : undefined}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {user.name.charAt(0)}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          )}
          
          {/* Mobilusis navigacijos stalčius */}
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
          >
            {drawerContent}
          </Drawer>
          
          {/* Paskyros meniu */}
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={menuOpen}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit" noWrap>
                {user?.name}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => {
              handleMenuClose();
              navigate('/profile');
            }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Mano profilis
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Atsijungti
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 