import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, List, ListItem,
  ListItemText, Button, Snackbar
} from '@mui/material';
import { Alert } from '@mui/material'; // Updated import

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/payments', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Payment successful', severity: 'success' });
      fetchPayments();
    } catch (error) {
      setSnackbar({ open: true, message: 'Payment failed', severity: 'error' });
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Payment
      </Typography>
      <List>
        {payments.map((payment) => (
          <ListItem key={payment._id}>
            <ListItemText
              primary={`Payment ID: ${payment._id}`}
              secondary={`Amount: $${payment.amount} | Date: ${new Date(payment.date).toLocaleDateString()}`}
            />
          </ListItem>
        ))}
      </List>
      <Button variant="contained" color="primary" onClick={handlePayment}>
        Make Payment
      </Button>
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

export default Payment;
