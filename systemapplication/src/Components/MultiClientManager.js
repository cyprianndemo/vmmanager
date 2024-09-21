import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Button, Table, TableBody, 
  TableCell, TableHead, TableRow, TextField, Dialog, 
  DialogActions, DialogContent, DialogTitle, Snackbar
} from '@mui/material';
import axios from 'axios';

const MultiClientManager = () => {
  const [subUsers, setSubUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    fetchSubUsers();
  }, []);

  const fetchSubUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/subusers');
      setSubUsers(response.data);
    } catch (error) {
      console.error('Error fetching sub-users:', error);
      setSnackbar({ open: true, message: 'Error fetching sub-users' });
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/users/subusers', newUser);
      setOpenDialog(false);
      setNewUser({ email: '', password: '', name: '' });
      setSubUsers([...subUsers, response.data]);
      setSnackbar({ open: true, message: 'Sub-user created successfully' });
    } catch (error) {
      console.error('Error creating sub-user:', error);
      setSnackbar({ open: true, message: 'Error creating sub-user' });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Multi-Client Management</Typography>
      
      <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)} sx={{ mb: 2 }}>
        Add New Sub-User
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subUsers.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Sub-User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateUser}>Create</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
};

export default MultiClientManager;