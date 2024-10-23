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
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/users'; 

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Error fetching users. Please try again.', 'error');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [fetchUsers, token, navigate]);

  const handleSuspendUser = async (userId) => {
    try {
      const response = await axios.post(`${API_URL}/suspend/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        showSnackbar(`User ${userId} has been suspended.`, 'success');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to suspend user. Please try again.';
      showSnackbar(errorMessage, 'error');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleUnsuspendUser = async (userId) => {
    try {
      const response = await axios.post(`${API_URL}/unsuspend/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        showSnackbar(`User ${userId} has been unsuspended.`, 'success');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error unsuspending user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to unsuspend user. Please try again.';
      showSnackbar(errorMessage, 'error');
      if (error.response?.status === 401) {
        navigate('/login');
      }
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
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Admin Panel
        <Button
          variant="contained"
          sx={{ backgroundColor: 'green', color: 'white' }}
          onClick={() => navigate(-1)}
        >
          Return
        </Button>
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user._id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.suspended ? 'Suspended' : 'Active'}</TableCell>
                <TableCell>
                  {user.suspended ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleUnsuspendUser(user._id)}
                    >
                      Unsuspend User
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleSuspendUser(user._id)}
                    >
                      Suspend User
                    </Button>
                  )}
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