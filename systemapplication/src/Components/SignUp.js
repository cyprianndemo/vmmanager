import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Container, Typography, Box, Snackbar, Alert, CircularProgress, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import GitHubIcon from '@mui/icons-material/GitHub';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', role: 'Guest', twoFactorAuth: false });
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for OAuth success
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const role = urlParams.get('role');
    if (token && role) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      setSnackbar({ open: true, message: 'OAuth registration successful', severity: 'success' });
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateForm = () => {
    if (formData.password.length < 8) {
      setSnackbar({ open: true, message: 'Password must be at least 8 characters long', severity: 'error' });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      setSnackbar({ open: true, message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character', severity: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
      if (formData.twoFactorAuth) {
        setQrCodeUrl(response.data.qrCodeUrl);
      }
      setSnackbar({ open: true, message: response.data.message, severity: 'success' });
      setTimeout(() => navigate('/login', { state: { email: formData.email } }), 2000);
    } catch (error) {
      setSnackbar({ open: true, message: 'Registration failed: ' + (error.response?.data?.message || error.message), severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/google/callback', { credential: credentialResponse.credential });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      setSnackbar({ open: true, message: 'Registration with Google successful', severity: 'success' });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      setSnackbar({ open: true, message: 'Google registration failed: ' + (error.response?.data?.message || error.message), severity: 'error' });
    }
  };

  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/github';
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>Register</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField variant="outlined" margin="normal" required fullWidth id="username" label="Username" name="username" value={formData.username} onChange={handleChange} autoComplete="username" autoFocus />
          <TextField variant="outlined" margin="normal" required fullWidth id="email" label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="email" />
          <TextField variant="outlined" margin="normal" required fullWidth name="password" label="Password" type="password" id="password" value={formData.password} onChange={handleChange} autoComplete="new-password" />
          <TextField variant="outlined" margin="normal" required fullWidth name="confirmPassword" label="Confirm Password" type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" />
          <FormControl fullWidth variant="outlined" margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select labelId="role-label" id="role" name="role" value={formData.role} onChange={handleChange} label="Role">
              <MenuItem value="Standard">Standard</MenuItem>
              <MenuItem value="Guest">Guest</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel control={<Checkbox checked={formData.twoFactorAuth} onChange={handleChange} name="twoFactorAuth" color="primary" />} label="Enable 2FA" />
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Register'}
          </Button>
        </Box>
        {qrCodeUrl && <Box sx={{ mt: 3, textAlign: 'center' }}><Typography variant="h6">Scan QR Code with your authenticator app</Typography><img src={qrCodeUrl} alt="QR Code" /></Box>}
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
            Register with GitHub
          </Button>
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" variant="body2">
              Log in here
            </Link>
          </Typography>
        </Box>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;