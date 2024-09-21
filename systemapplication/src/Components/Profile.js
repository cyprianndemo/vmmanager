import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        setError('Failed to fetch user');
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:5000/api/users/profile', { username, email }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setError('');
      // Optionally, refresh user data after update
      const response = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsername(response.data.username);
      setEmail(response.data.email);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      navigate('/login'); // Redirect to login after deletion
    } catch (err) {
      setError('Failed to delete account');
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4" align="center" gutterBottom>
        Profile
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
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
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
        >
          Save
        </Button>
      </form>
      <Box mt={2}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          onClick={handleDelete}
        >
          Delete Account
        </Button>
      </Box>
    </Container>
  );
};

export default Profile;
