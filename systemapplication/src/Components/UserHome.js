import React, { useEffect, useState } from 'react';
import { AppBar, Typography, Container, Snackbar, Alert, Button, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UserHome = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Redirect to login if not authenticated
    }
  }, [navigate]);

  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>User Dashboard</Button>
          <Button color="inherit" onClick={() => navigate('/subscription')}>Subscription Management</Button>
        </Toolbar>
      </AppBar>

      <Typography variant="h5" gutterBottom>
        Virtual Machines Overview
      </Typography>
      <Typography variant="body1" paragraph>
        Our virtual machine service allows you to deploy and manage your virtual machines effortlessly.
        You can choose from various specifications tailored to your needs and easily scale your resources
        as your requirements grow.
      </Typography>
      <Typography variant="body1" paragraph>
        With our user-friendly interface, managing your virtual machines has never been easier. 
        You can monitor performance, manage backups, and scale your operations without any hassle.
      </Typography>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserHome;
