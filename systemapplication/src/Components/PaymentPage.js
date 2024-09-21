import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, List, ListItem, ListItemText, Snackbar } from '@mui/material';
import PaymentDetailsForm from './PaymentDetailsForm';
import { Alert } from '@mui/material';
import axios from 'axios';

const PaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setSnackbar({ open: true, message: 'Failed to fetch payments', severity: 'error' });
    }
  };

  const handleInitiatePayment = () => {
    setShowForm(true);
  };

  const handlePayment = async (paymentDetails) => {
    setIsProcessing(true);
    setErrorMessage('');
    setPaymentStatus(null);
  
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentDetails)
      });
  
      if (!response.ok) {
        const errorText = await response.json();
        console.error('Error response:', errorText);
        throw new Error(errorText.message || 'Network response was not ok');
      }
  
      const data = await response.json();
  
      if (data.message === 'Subscription successful') {
        setPaymentStatus('Payment Successful');
        setSnackbar({ open: true, message: 'Payment Successful', severity: 'success' });
        fetchPayments(); // Refresh payments after successful payment
      } else {
        throw new Error(data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'An error occurred during payment processing');
      setSnackbar({ open: true, message: 'Payment failed', severity: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Payment
      </Typography>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        {!showForm ? (
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleInitiatePayment}>
              Proceed to Payment
            </Button>
          </Box>
        ) : (
          <PaymentDetailsForm 
            onSubmit={handlePayment} 
            isProcessing={isProcessing} 
          />
        )}
        {paymentStatus && (
          <Typography variant="body1" color="green" sx={{ mt: 2 }}>
            {paymentStatus}
          </Typography>
        )}
        {errorMessage && (
          <Typography variant="body1" color="red" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
        )}
      </Box>

      <Typography variant="h5" component="h2" gutterBottom align="center">
        Payment History
      </Typography>
      <List>
        {payments.map((payment) => (
          <ListItem key={payment._id}>
            <ListItemText
              primary={`Payment ID: ${payment._id}`}
              secondary={`Amount: $${payment.amount} | Date: ${new Date(payment.createdAt).toLocaleDateString()}`}
            />
          </ListItem>
        ))}
      </List>

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

export default PaymentPage;
