import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import axios from 'axios';

const Profile = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsername(response.data.username);
        setEmail(response.data.email);
      } catch (err) {
        setError('Failed to fetch user profile');
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:5000/api/users/profile', 
        { username, email, password }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Profile updated successfully');
      setError('');
      setPassword('');
    } catch (err) {
      setError('Failed to update profile');
      setSuccess('');
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4" align="center" gutterBottom>
        Profile
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="success">{success}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="password"
          label="New Password (leave blank to keep current)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
        >
          Save Changes
        </Button>
      </form>
    </Container>
  );
};

export default Profile;