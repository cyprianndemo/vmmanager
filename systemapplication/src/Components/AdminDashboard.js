import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Computer as ComputerIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [vms, setVms] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVM, setSelectedVM] = useState(null);
  const [editUserData, setEditUserData] = useState({ username: '', email: '', role: '' });
  const [editVMData, setEditVMData] = useState({ name: '', specs: '', userId: '' });
  const [activeTab, setActiveTab] = useState(0);
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentSuspensionLoading, setPaymentSuspensionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
  
      const [usersResponse, vmsResponse, paymentsResponse, activitiesResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/users', config),
        axios.get('http://localhost:5000/api/vms', config),
        axios.get('http://localhost:5000/api/payments/history', config),
        axios.get('http://localhost:5000/api/activities', config),
      ]);
      
      setUsers(usersResponse.data);
      setVms(vmsResponse.data);
      setPayments(paymentsResponse.data);
      setActivities(activitiesResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', err);
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (type, item = null) => {
    setDialogType(type);
    if (type.startsWith('user')) {
      setSelectedUser(item);
      if (type === 'editUser' && item) {
        setEditUserData({ username: item.username, email: item.email, role: item.role });
      }
    } else if (type.startsWith('vm')) {
      setSelectedVM(item);
      if (type === 'editVM' && item) {
        setEditVMData({ name: item.name, specs: item.specs, userId: item.userId });
      }
    } else if (type === 'suspendUser') {
      setSelectedPayment(item);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setSelectedVM(null);
    setEditUserData({ username: '', email: '', role: '' });
    setEditVMData({ name: '', specs: '', userId: '' });
  };

  const handleSuspendUser = async () => {
    setPaymentSuspensionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/users/${selectedPayment.userId}/suspend`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to suspend user. Please try again.');
      console.error('Error suspending user:', err);
    } finally {
      setPaymentSuspensionLoading(false);
    }
  };
  
  const handleEditUser = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/users/${selectedUser._id}`, editUserData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to update user. Please try again.');
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to delete user. Please try again.');
      console.error('Error deleting user:', err);
    }
  };

  const handleCreateVM = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/vms', editVMData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to create VM. Please try again.');
      console.error('Error creating VM:', err);
    }
  };

  const handleEditVM = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/vms/${selectedVM._id}`, editVMData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to update VM. Please try again.');
      console.error('Error updating VM:', err);
    }
  };

  const handleDeleteVM = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/vms/${selectedVM._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      handleCloseDialog();
    } catch (err) {
      setError('Failed to delete VM. Please try again.');
      console.error('Error deleting VM:', err);
    }
  };

  const handleMoveVM = async () => {
    try {
      if (!selectedVM || !selectedVM.userId) {
        throw new Error('Invalid VM selected or VM has no assigned user');
      }
  
      if (!editVMData.userId) {
        throw new Error('No new user selected for VM move');
      }
  
      const token = localStorage.getItem('token');
      const originalUser = users.find(user => user._id === selectedVM.userId);
      const newUser = users.find(user => user._id === editVMData.userId);
  
      if (!originalUser || !newUser) {
        throw new Error('Original or new user not found');
      }
  
      // Move VM
      await axios.patch(`http://localhost:5000/api/vms/${selectedVM._id}/move`, { newUserId: editVMData.userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // Send notifications
      await axios.post('http://localhost:5000/api/notifications', {
        originalUserId: selectedVM.userId,
        newUserId: editVMData.userId,
        vmName: selectedVM.name,
        originalUserEmail: originalUser.email,
        newUserEmail: newUser.email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // Log the action
      await axios.post('http://localhost:5000/api/audit-log', {
        action: 'move_vm',
        vmId: selectedVM._id,
        fromUserId: selectedVM.userId,
        toUserId: editVMData.userId,
        adminId: localStorage.getItem('userId') // Assuming you store the admin's ID in localStorage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      fetchData();
      handleCloseDialog();
    } catch (err) {
      console.error('Error moving VM:', err);
      setError(`Failed to move VM: ${err.message}`);
    }
  };

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    if (newValue === 5) { 
      navigate('/admin/panel');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={() => navigate('/logout')}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Overview" />
          <Tab label="Users" />
          <Tab label="VMs" />
          <Tab label="Activities" />
          <Tab label="Payments" />
          <Tab label="Panel" />
        </Tabs>

        {activeTab === 0 && (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    <PersonIcon /> Total Users
                  </Typography>
                  <Typography variant="h3">{users.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    <SecurityIcon /> Admins
                  </Typography>
                  <Typography variant="h3">
                    {users.filter(user => user.role === 'Admin').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    <ComputerIcon /> Total VMs
                  </Typography>
                  <Typography variant="h3">{vms.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    <TimelineIcon /> Activities
                  </Typography>
                  <Typography variant="h3">{activities.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                User Management
              </Typography>
              <List>
                {users.map((user) => (
                  <ListItem key={user._id}>
                    <ListItemText
                      primary={user.username}
                      secondary={`${user.email} - ${user.role} - 2FA: ${user.twoFactorEnabled ? 'Enabled' : 'Disabled'}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog('editUser', user)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDialog('deleteUser', user)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {activeTab === 2 && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                VM Management
              </Typography>
              <Button variant="contained" color="primary" onClick={() => handleOpenDialog('createVM')} sx={{ mb: 2 }}>
                Create New VM
              </Button>
              <List>
                {vms.map((vm) => (
                  <ListItem key={vm._id}>
                    <ListItemText
                      primary={vm.name}
                      secondary={`Specs: ${vm.specs} | User: ${users.find(u => u._id === vm.userId)?.email || 'Unassigned'}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog('editVM', vm)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDialog('deleteVM', vm)}>
                        <DeleteIcon />
                      </IconButton>
                      <Button edge="end" onClick={() => handleOpenDialog('moveVM', vm)}>
                        Move
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {activeTab === 3 && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                User Activities
              </Typography>
              <List>
                {activities.map((activity) => (
                  <ListItem key={activity._id}>
                    <ListItemText
                      primary={`${activity.action} by ${activity.username}`}
                      secondary={`${activity.details} - ${new Date(activity.timestamp).toLocaleString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {activeTab === 4 && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h5" component="div" gutterBottom>
                Payment Management
              </Typography>
              <List>
                {payments.map((payment) => (
                  <ListItem key={payment._id}>
                    <ListItemText
                      primary={`User: ${payment.username}`}
                      secondary={`Amount: $${payment.amount} | Status: ${payment.status}`}/>
                      <ListItemSecondaryAction>
                        {payment.status === 'Pending' && (
                          <Button edge="end" onClick={() => handleOpenDialog('suspendUser', payment)}>
                            Suspend Account
                          </Button>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
          {activeTab === 5 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  Redirecting to Panel...
                </Typography>
              </CardContent>
            </Card>
          )}
        </Container>
  
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>
            {dialogType === 'editUser' ? 'Edit User' :
             dialogType === 'deleteUser' ? 'Delete User' :
             dialogType === 'createVM' ? 'Create VM' :
             dialogType === 'editVM' ? 'Edit VM' :
             dialogType === 'deleteVM' ? 'Delete VM' :
             dialogType === 'suspendUser' ? 'Suspend User' :
             dialogType === 'moveVM' ? 'Move VM' : ''}
          </DialogTitle>
          <DialogContent>
            {dialogType === 'editUser' && (
              <>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Username"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={editUserData.username}
                  onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })}
                />
                <TextField
                  margin="dense"
                  label="Email"
                  type="email"
                  fullWidth
                  variant="standard"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                />
                <TextField
                  select
                  margin="dense"
                  label="Role"
                  fullWidth
                  variant="standard"
                  value={editUserData.role}
                  onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="Guest">Guest</MenuItem>
                </TextField>
              </>
            )}
            {(dialogType === 'createVM' || dialogType === 'editVM' || dialogType === 'moveVM') && (
              <>
                <TextField
                  autoFocus
                  margin="dense"
                  label="VM Name"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={editVMData.name}
                  onChange={(e) => setEditVMData({ ...editVMData, name: e.target.value })}
                />
                <TextField
                  margin="dense"
                  label="VM Specs"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={editVMData.specs}
                  onChange={(e) => setEditVMData({ ...editVMData, specs: e.target.value })}
                />
                <TextField
                  select
                  margin="dense"
                  label="Assign to User"
                  fullWidth
                  variant="standard"
                  value={editVMData.userId}
                  onChange={(e) => setEditVMData({ ...editVMData, userId: e.target.value })}
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>{user.username}</MenuItem>
                  ))}
                </TextField>
              </>
            )}
            {(dialogType === 'deleteUser' || dialogType === 'deleteVM') && (
              <Typography>Are you sure you want to delete this {dialogType === 'deleteUser' ? 'user' : 'VM'}?</Typography>
            )}
            {dialogType === 'suspendUser' && (
              <Typography>
                Are you sure you want to suspend the account for this user? This will prevent further logins until payment is received.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={
              dialogType === 'editUser' ? handleEditUser :
              dialogType === 'deleteUser' ? handleDeleteUser :
              dialogType === 'createVM' ? handleCreateVM :
              dialogType === 'editVM' ? handleEditVM :
              dialogType === 'deleteVM' ? handleDeleteVM :
              dialogType === 'moveVM' ? handleMoveVM :
              dialogType === 'suspendUser' ? handleSuspendUser :
              handleCloseDialog
            } color="primary" disabled={paymentSuspensionLoading}>
              {dialogType === 'deleteUser' || dialogType === 'deleteVM' ? 'Delete' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
  
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    );
  };
  
  export default AdminDashboard;