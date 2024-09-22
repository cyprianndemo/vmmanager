import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Paper, Grid, Button, Snackbar, Alert, AppBar, Toolbar,
  IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';

const GuestDashboard = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch guest user subscription details
      const response = await axios.get('http://localhost:5000/api/subscriptions/subscribe', config);
      setSubscription(response.data);

      setSnackbar({ open: true, message: 'Data fetched successfully', severity: 'success' });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
      setSnackbar({ open: true, message: 'Failed to fetch data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Guest Dashboard
          </Typography>
          <Button color="inherit" onClick={() => navigate('/')}>Home</Button>

          <IconButton color="inherit" onClick={handleProfileClick}>
            <AccountCircleIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container>
        <Grid container spacing={3}>
          {/* Display current subscription details */}
          {subscription && (
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Current Subscription
                </Typography>
                <Typography>Plan: {subscription.plan}</Typography>
                <Typography>Status: {subscription.status}</Typography>
                <Typography>Next billing date: {new Date(subscription.nextBillingDate).toLocaleDateString()}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Snackbar Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileClose}
        >
          <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
          <MenuItem onClick={() => navigate('/settings')}>Settings</MenuItem>
        </Menu>
      </Container>
    </>
  );
};

export default GuestDashboard;
