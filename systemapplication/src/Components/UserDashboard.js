import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Paper, Grid, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Slider, Snackbar, Alert, AppBar, Toolbar,
  IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import SubscriptionManagement from './SubscriptionManagement';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [vms, setVms] = useState([]);
  const [activities, setActivities] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVM, setSelectedVM] = useState(null);
  const [diskSize, setDiskSize] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editVMData, setEditVMData] = useState({ id: null, name: '', specs: '' });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [subscriptionResponse, paymentsResponse, vmsResponse, activitiesResponse] = await Promise.all([
        //axios.get('http://localhost:5000/api/subscription', config),
        //axios.get('http://localhost:5000/api/payments', config),
        //axios.get('http://localhost:5000/api/vms/user', config), // Fetch user's VMs
        //axios.get('http://localhost:5000/api/activities', config),
      ]);

     
      setVms(vmsResponse.data);
      //setActivities(activitiesResponse.data);
      setSnackbar({ open: true, message: 'Data fetched successfully', severity: 'success' });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
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

  const handleOpenDialog = (type, vm = null) => {
    if (type === 'editVM' && vm) {
      setEditVMData({ id: vm._id, name: vm.name, specs: vm.specs });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditVMData({ id: null, name: '', specs: '' });
  };

  const handleEditVM = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/vms/${editVMData.id}`, editVMData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'VM updated successfully', severity: 'success' });
      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating VM:', error);
      setSnackbar({ open: true, message: 'Failed to update VM. Please try again.', severity: 'error' });
    }
  };

  const handleCreateBackup = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/backups', { vmId: selectedVM, diskSize }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Backup created successfully', severity: 'success' });
      fetchData();
    } catch (error) {
      console.error('Error creating backup:', error);
      setSnackbar({ open: true, message: 'Failed to create backup. Please try again.', severity: 'error' });
    }
  };

  const handleSubscriptionChange = () => {
    fetchData();
  };

  const backupPrice = diskSize * 0.5; // Assuming $0.5 per GB

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
            User Dashboard
          </Typography>
          <Button color="inherit" onClick={() => navigate('/')}>Home</Button>
          <Button color="inherit" onClick={() => navigate('/client')}>Multi-Client</Button>

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
          {/* Subscription Management */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <SubscriptionManagement onSubscriptionChange={handleSubscriptionChange} subscription={subscription} />
            </Paper>
          </Grid>

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

        {/* Edit VM Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Edit VM</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="VM Name"
              type="text"
              fullWidth
              variant="standard"
              value={editVMData.name}
              onChange={(e) => setEditVMData({ ...editVMData, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="VM Specs"
              type="text"
              fullWidth
              variant="standard"
              value={editVMData.specs}
              onChange={(e) => setEditVMData({ ...editVMData, specs: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleEditVM} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default UserDashboard;