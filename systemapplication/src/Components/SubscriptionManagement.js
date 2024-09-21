import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Button, Card, CardContent, Checkbox, FormControlLabel,
  CardActions, Grid, Snackbar, CircularProgress, TextField, Dialog, DialogActions, 
  DialogContent, DialogTitle, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import { Alert } from '@mui/material';

const SubscriptionManagement = () => {
  const [plans, setPlans] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [vms, setVMs] = useState([]);
  const [error, setError] = useState('');
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedVM, setSelectedVM] = useState(null);
  const [backupSize, setBackupSize] = useState('');
  const [backupPrice, setBackupPrice] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    phoneNumber: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchPlans();
        await fetchCurrentSubscription();
        await fetchPaymentHistory();
        await fetchUserVMs();
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load subscription data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/rate-plans', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error.response ? error.response.data : error.message);
      setSnackbar({ open: true, message: 'Error fetching plans', severity: 'error' });
      throw error;
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/payments/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentHistory(response.data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/subscriptions/current', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentSubscription(response.data);
    } catch (error) {
      console.error('Error fetching current subscription:', error);
    }
  };

  const fetchUserVMs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/vms/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVMs(response.data);
    } catch (error) {
      console.error('Error fetching user VMs:', error);
      setSnackbar({ open: true, message: 'Error fetching VMs', severity: 'error' });
    }
  };

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handlePaymentSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/subscriptions/subscribe', 
        { 
          planId: selectedPlan._id,
          paymentMethod: paymentDetails.paymentMethod,
          cardNumber: paymentDetails.cardNumber,
          expiryDate: paymentDetails.expiryDate,
          cvv: paymentDetails.cvv,
          phoneNumber: paymentDetails.phoneNumber,
          testMode: testMode
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setSnackbar({ open: true, message: 'Subscription successful', severity: 'success' });
      fetchCurrentSubscription();
      setDialogOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Subscription failed', severity: 'error' });
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPaymentDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleBackupRequest = (vm) => {
    setSelectedVM(vm);
    setBackupDialogOpen(true);
  };

  const handleBackupSizeChange = (event) => {
    const size = event.target.value;
    setBackupSize(size);
    setBackupPrice(size * 5.0);
  };

  const handleBackupSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/vms/${selectedVM._id}/backup`, 
        { 
          backupSize,
          price: backupPrice
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setSnackbar({ open: true, message: 'Backup created successfully', severity: 'success' });
      setBackupDialogOpen(false);
      fetchUserVMs(); 
    } catch (error) {
      setSnackbar({ open: true, message: 'Backup creation failed', severity: 'error' });
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Subscription Management
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          {currentSubscription && (
            <Typography variant="h6" gutterBottom>
              Current Plan: {currentSubscription.plan ? currentSubscription.plan.name : 'No active subscription'}
            </Typography>
          )}
          <Grid container spacing={3}>
            {plans.length > 0 ? (
              plans.map((plan) => (
                <Grid item xs={12} sm={6} md={3} key={plan._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" component="div">
                        {plan.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan.description}
                      </Typography>
                      <Typography variant="h6" color="text.primary">
                        ${plan.price} per month
                      </Typography>
                      <Typography variant="body2">
                        Max VMs: {plan.maxVMs}
                      </Typography>
                      <Typography variant="body2">
                        Max Backups: {plan.maxBackups}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => handleSubscribe(plan)}>
                        {currentSubscription && currentSubscription.plan === plan.name
                          ? 'Change Plan'
                          : 'Subscribe'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography>No plans available.</Typography>
            )}
          </Grid>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Your Virtual Machines
          </Typography>
          <Grid container spacing={3}>
            {vms.map((vm) => (
              <Grid item xs={12} sm={6} md={4} key={vm._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{vm.name}</Typography>
                    <Typography>Status: {vm.status}</Typography>
                    <Typography>Last Backup: {vm.lastBackup ? new Date(vm.lastBackup).toLocaleString() : 'Never'}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleBackupRequest(vm)}>
                      Create Backup
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Payment History
          </Typography>
          {paymentHistory.length > 0 ? (
            <Grid container spacing={3}>
              {paymentHistory.map((payment, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Plan: {payment.ratePlan}</Typography>
                      <Typography>Amount: ${payment.amount}</Typography>
                      <Typography>Status: {payment.status}</Typography>
                      <Typography>Description: {payment.description}</Typography>
                      <Typography>Date: {new Date(payment.createdAt).toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>No payment history found.</Typography>
          )}
        </>
      )}

      {/* Subscription Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Subscribe to {selectedPlan?.name}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="paymentMethod"
            label="Payment Method"
            type="text"
            fullWidth
            variant="outlined"
            value={paymentDetails.paymentMethod}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="cardNumber"
            label="Card Number"
            type="text"
            fullWidth
            variant="outlined"
            value={paymentDetails.cardNumber}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="expiryDate"
            label="Expiry Date"
            type="text"
            fullWidth
            variant="outlined"
            value={paymentDetails.expiryDate}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="cvv"
            label="CVV"
            type="text"
            fullWidth
            variant="outlined"
            value={paymentDetails.cvv}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="phoneNumber"
            label="Phone Number"
            type="text"
            fullWidth
            variant="outlined"
            value={paymentDetails.phoneNumber}
            onChange={handleInputChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={testMode}
                onChange={() => setTestMode(!testMode)}
                name="testMode"
              />
            }
            label="Test Mode (Simulate Payment)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePaymentSubmit}>Subscribe</Button>
        </DialogActions>
      </Dialog>

      {/* Backup Dialog */}
      <Dialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)}>
        <DialogTitle>Create Backup for {selectedVM?.name}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel id="backup-size-label">Backup Size (GB)</InputLabel>
            <Select
              labelId="backup-size-label"
              value={backupSize}
              onChange={handleBackupSizeChange}
              label="Backup Size (GB)"
            >
              <MenuItem value={10}>10 GB</MenuItem>
              <MenuItem value={20}>20 GB</MenuItem>
              <MenuItem value={50}>50 GB</MenuItem>
              <MenuItem value={100}>100 GB</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Estimated Price: ${backupPrice.toFixed(2)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBackupSubmit}>Create Backup</Button>
        </DialogActions>
      </Dialog>

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

export default SubscriptionManagement;