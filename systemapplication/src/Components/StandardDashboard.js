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
  Check as CheckIcon, 
  Storage as StorageIcon, 
  Backup as BackupIcon, 
  Security as SecurityIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Define some standard user-specific functionalities
const standardFeatures = [
  { icon: <StorageIcon />, text: 'Manage your own Virtual Machines' },
  { icon: <BackupIcon />, text: 'Create and manage your backups' },
  { icon: <SecurityIcon />, text: 'Update your security settings' },
];

const StandardDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Standard User Dashboard
          </Typography>
          <Button color="inherit" onClick={() => navigate('/logout')}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Welcome Standard User
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          {standardFeatures.map((feature, index) => (
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
      </Container>
    </Box>
  );
};

export default StandardDashboard;
