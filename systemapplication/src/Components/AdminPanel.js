import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';

const API_URL = 'http://localhost:5000/api';

const AdminPanel = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/payments`);
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      showSnackbar('Error fetching payments. Please try again.', 'error');
    }
    setLoading(false);
  }, []); // No dependencies, so this function won't change on each render

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]); // Now it's safe to include fetchPayments here

  const handleSuspendUser = async (userId) => {
    try {
      const response = await axios.post(`${API_URL}/admin/suspend/${userId}`);
      if (response.data.success) {
        showSnackbar(`User ${userId} has been suspended.`, 'success');
        fetchPayments();
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      showSnackbar('Failed to suspend user. Please try again.', 'error');
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
      <Typography variant="h4" gutterBottom>Admin Panel</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Feature</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.userId}</TableCell>
                <TableCell>{payment.feature}</TableCell>
                <TableCell>${payment.amount}</TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleSuspendUser(payment.userId)}
                  >
                    Suspend User
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPanel;
