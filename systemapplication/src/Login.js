import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, Container, Typography, Box, Snackbar, Alert, CircularProgress, Link } from '@mui/material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import GitHubIcon from '@mui/icons-material/GitHub';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
      setFormData(prevData => ({ ...prevData, email: location.state.email }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);

      setSnackbar({ open: true, message: 'Login successful', severity: 'success' });

      setTimeout(() => {
        switch (response.data.role) {
          case 'Admin':
            navigate('/admin/dashboard');
            break;
          case 'Standard':
            navigate('/dashboard');
            break;
          default:
            navigate('/guest-dashboard');
        }
      }, 1000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/google/callback', { credential: credentialResponse.credential });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      setSnackbar({ open: true, message: 'Login with Google successful', severity: 'success' });
      setTimeout(() => navigate(response.data.role === 'Admin' ? '/admin/dashboard' : '/dashboard'), 2000);
    } catch (error) {
      setSnackbar({ open: true, message: 'Google login failed: ' + (error.response?.data?.message || error.message), severity: 'error' });
    }
  };

  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/github';
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>Login</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField variant="outlined" margin="normal" required fullWidth id="email" label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="email" autoFocus />
          <TextField variant="outlined" margin="normal" required fullWidth name="password" label="Password" type="password" id="password" value={formData.password} onChange={handleChange} autoComplete="current-password" />
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </Box>
        <Box sx={{ mt: 2 }}>
          <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            onSuccess={handleGoogleSuccess}
            onError={() => setSnackbar({ open: true, message: 'Google login failed', severity: 'error' })}
            cookiePolicy={'single_host_origin'}
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            startIcon={<GitHubIcon />}
            onClick={handleGitHubLogin}
          >
            Login with GitHub
          </Button>
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/signup" variant="body2">
              Sign up here
            </Link>
          </Typography>
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Forgot Password?
          </Link>
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

export default Login;