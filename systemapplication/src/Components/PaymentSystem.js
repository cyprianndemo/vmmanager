import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';

const API_URL = 'http://localhost:5000/api';

const PaymentSystem = () => {
  const [user, setUser] = useState(null);
  const [features, setFeatures] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    console.log('Fetching data from API...');
    const token = localStorage.getItem('authToken'); // Adjust this line as needed

    const randomParam = new Date().getTime(); // Unique timestamp to avoid caching

    try {
      const [userResponse, featuresResponse, paymentsResponse] = await Promise.all([
        axios.get(`${API_URL}/user/1?t=${randomParam}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/features?t=${randomParam}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/payments/1?t=${randomParam}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      console.log('User:', userResponse.data);
      console.log('Features:', featuresResponse.data);
      console.log('Payments:', paymentsResponse.data);

      setUser(userResponse.data);
      setFeatures(featuresResponse.data);
      setPayments(paymentsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Error fetching data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePayment = async (featureId) => {
    const token = localStorage.getItem('authToken'); // Adjust this line as needed
    try {
      const response = await axios.post(`${API_URL}/payment`, { userId: user.id, featureId }, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        showSnackbar(`Payment for ${response.data.payment.feature} was successful!`, 'success');
        fetchData(); // Refresh data after payment
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      showSnackbar('Payment failed. Please try again.', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>User Information</Typography>
          {user && (
            <>
              <Typography><strong>Name:</strong> {user.name}</Typography>
              <Typography><strong>Email:</strong> {user.email}</Typography>
              <Typography><strong>Account Status:</strong> {user.accountStatus}</Typography>
            </>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Available Features</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Feature</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {features.map((feature) => (
                  <TableRow key={feature.id}>
                    <TableCell>{feature.name}</TableCell>
                    <TableCell>${feature.price}</TableCell>
                    <TableCell>
                      <Button variant="contained" color="primary" onClick={() => handlePayment(feature.id)}>
                        Pay Now
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Payment History</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Feature</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.feature}</TableCell>
                    <TableCell>${payment.amount}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PaymentSystem;
