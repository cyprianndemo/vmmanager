import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Button, Card, CardContent, Checkbox, FormControlLabel,
  CardActions, Grid, Snackbar, CircularProgress, TextField, Dialog, DialogActions, 
  DialogContent, DialogTitle, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import { Alert } from '@mui/material';

const PaymentMethods = {
  MPESA: 'M-Pesa',
  CREDIT_CARD: 'Credit Card'
};

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
    paymentMethod: PaymentMethods.MPESA, 
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
        const response = await axios.post('http://localhost:5000/api/payments/subscribe', 
            { 
                planId: selectedPlan._id,
                paymentMethod: paymentDetails.paymentMethod,
                cardNumber: paymentDetails.paymentMethod === PaymentMethods.CREDIT_CARD ? paymentDetails.cardNumber : undefined,
                expiryDate: paymentDetails.paymentMethod === PaymentMethods.CREDIT_CARD ? paymentDetails.expiryDate : undefined,
                cvv: paymentDetails.paymentMethod === PaymentMethods.CREDIT_CARD ? paymentDetails.cvv : undefined,
                phoneNumber: paymentDetails.paymentMethod === PaymentMethods.MPESA ? paymentDetails.phoneNumber : undefined,
                testMode: testMode
            },
            { headers: { 'Authorization': `Bearer ${token}` } }
        );

        setSnackbar({ open: true, message: response.data.message, severity: 'success' });
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
          <Grid container spacing={3}>
            {paymentHistory.map((payment) => (
              <Grid item xs={12} key={payment._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Payment ID: {payment._id}</Typography>
                    <Typography>Date: {new Date(payment.date).toLocaleDateString()}</Typography>
                    <Typography>Amount: ${payment.amount}</Typography>
                    <Typography>Method: {payment.method}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogContent>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentDetails.paymentMethod}
                  onChange={(e) => {
                    setPaymentDetails((prev) => ({ ...prev, paymentMethod: e.target.value }));
                  }}
                >
                  <MenuItem value={PaymentMethods.MPESA}>M-Pesa</MenuItem>
                  <MenuItem value={PaymentMethods.CREDIT_CARD}>Credit Card</MenuItem>
                </Select>
              </FormControl>

              {paymentDetails.paymentMethod === PaymentMethods.CREDIT_CARD && (
                <>
                  <TextField
                    label="Card Number"
                    name="cardNumber"
                    value={paymentDetails.cardNumber}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Expiry Date (MM/YY)"
                    name="expiryDate"
                    value={paymentDetails.expiryDate}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="CVV"
                    name="cvv"
                    value={paymentDetails.cvv}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </>
              )}

              {paymentDetails.paymentMethod === PaymentMethods.MPESA && (
                <TextField
                  label="Phone Number"
                  name="phoneNumber"
                  value={paymentDetails.phoneNumber}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
              )}

              <FormControlLabel
                control={<Checkbox checked={testMode} onChange={(e) => setTestMode(e.target.checked)} />}
                label="Test Mode"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handlePaymentSubmit}>Submit Payment</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)}>
            <DialogTitle>Backup Size</DialogTitle>
            <DialogContent>
              <TextField
                label="Backup Size (in GB)"
                type="number"
                value={backupSize}
                onChange={handleBackupSizeChange}
                fullWidth
              />
              <Typography>Estimated Price: ${backupPrice}</Typography>
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
        </>
      )}
    </Container>
  );
};

export default SubscriptionManagement;
