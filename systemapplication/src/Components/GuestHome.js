import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent,
  CardActions,
  Button, 
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Storage as StorageIcon, 
  Backup as BackupIcon, 
  Security as SecurityIcon, 
  Payment as PaymentIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const guestFeatures = [
  { icon: <StorageIcon />, text: 'Explore Virtual Machine options' },
  { icon: <BackupIcon />, text: 'Learn about backup options' },
  { icon: <SecurityIcon />, text: 'Understand our security measures' },
  { icon: <PaymentIcon />, text: 'View pricing plans' },
];

const plans = [
  { id: 1, name: 'Bronze', maxVMs: 1, maxBackups: 3, price: 9.99 },
  { id: 2, name: 'Silver', maxVMs: 3, maxBackups: 5, price: 19.99 },
  { id: 3, name: 'Gold', maxVMs: 5, maxBackups: 10, price: 49.99 },
  { id: 4, name: 'Platinum', maxVMs: 10, maxBackups: 20, price: 99.99 },
];

const GuestHome = () => {
  const navigate = useNavigate();

  const handlePlanClick = (plan) => {
    navigate('/signup', { state: { selectedPlan: plan } });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            VM Management Platform
          </Typography>
          <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
          <Button color="inherit" onClick={() => navigate('/signup')}>Sign Up</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Welcome to VM Management Platform
        </Typography>

        <Typography variant="h6" gutterBottom align="center" color="text.secondary">
          Explore our services and learn more about what we offer.
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          {guestFeatures.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                {feature.icon}
                <Typography variant="body1" align="center" sx={{ mt: 2 }}>
                  {feature.text}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 6, mb: 4 }} align="center">
          Choose Your Plan
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan) => (
            <Grid item key={plan.id} xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" align="center">
                    {plan.name}
                  </Typography>
                  <Typography variant="h4" component="p" align="center" color="primary" sx={{ mb: 2 }}>
                    ${plan.price.toFixed(2)}
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={`Up to ${plan.maxVMs} VMs`} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={`${plan.maxBackups} backups included`} />
                    </ListItem>
                  </List>
                </CardContent>
                <CardActions>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="primary"
                    onClick={() => handlePlanClick(plan)}
                  >
                    Choose {plan.name}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom align="center">
            Why Choose Our VM Management Platform?
          </Typography>
          <Typography variant="body1" paragraph align="center">
            Our platform offers comprehensive solutions for managing your virtual machines with ease. With features like automated backups, easy VM creation, and flexible subscription plans, we provide the tools you need to efficiently manage your virtualized infrastructure.
          </Typography>
          <Typography variant="body1" paragraph align="center">
            Security is our top priority. We implement role-based access control and Single Sign-On (SSO) to ensure that your data and resources are protected. Explore our features and see why our customers choose us.
          </Typography>
        </Box>

      </Container>
    </Box>
  );
};

export default GuestHome;