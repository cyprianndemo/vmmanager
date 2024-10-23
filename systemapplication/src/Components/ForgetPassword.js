import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Container, Typography, Box, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
const ForgetPassword = () => {
    const [formData, setFormData] = useState({
        email: '',
        newPassword: '',
        confirmPassword: ''
      });
      const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
      const [loading, setLoading] = useState(false);
      const navigate = useNavigate();
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
          setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
          return;
        }
        setLoading(true);
        try {
          const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
            email: formData.email,
            newPassword: formData.newPassword
          });
          setSnackbar({ open: true, message: response.data.message, severity: 'success' });
          setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Password reset failed. Please try again.';
          setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        } finally {
          setLoading(false);
        }
      };
    
      return (
        <Container maxWidth="xs">
          <Box sx={{ mt: 8, mb: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>Reset Password</Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                autoFocus
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type="password"
                id="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
            </Box>
          </Box>
          <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      );
    };

export default ForgetPassword;