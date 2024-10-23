import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Button, Table, TableBody, 
  TableCell, TableHead, TableRow, TextField, Dialog, 
  DialogActions, DialogContent, DialogTitle, Snackbar, Select, MenuItem
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

const AdminMultiUsers = () => {
  const [subUsers, setSubUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'Standard' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const navigate = useNavigate(); 

  useEffect(() => {
    fetchSubUsers();
  }, []);

  const fetchSubUsers = async () => {
    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.get('http://localhost:5000/api/users/sub-admin', {
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });
      setSubUsers(response.data);
    } catch (error) {
      console.error('Error fetching sub-admin:', error);
      setSnackbar({ open: true, message: 'Error fetching sub-admin' });
    }
  };
  
  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const userPayload = {
        username: newUser.username.trim(), 
        email: newUser.email.trim(),
        password: newUser.password,
        role: newUser.role 
      };
  
      const response = await axios.post('http://localhost:5000/api/users/sub-admin', userPayload, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      setOpenDialog(false);
      setNewUser({ username: '', email: '', password: '', role: 'Standard' });
      setSubUsers([...subUsers, response.data]);
      setSnackbar({ open: true, message: 'Sub-admin created successfully' });
    } catch (error) {
      console.error('Error creating sub-admin:', error);
      setSnackbar({ open: true, message: 'Error creating sub-admin: ' + error.response.data.message });
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
      <Typography variant="h4" gutterBottom>Multi-Admin Management</Typography>
      
      <Button 
  variant="contained" 
  sx={{ mb: 2, backgroundColor: 'green', color: 'white', ml: 'auto', display: 'block' }} 
  onClick={() => navigate(-1)}
>
  Return
</Button>


      <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)} sx={{ mb: 2 }}>
        Add New Sub-Admin
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subUsers.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Sub-admin</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
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
          <Select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            fullWidth
            margin="dense"
          >
            <MenuItem value="Standard">Standard</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
          </Select>
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

export default AdminMultiUsers;
