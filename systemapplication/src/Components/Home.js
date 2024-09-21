import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Check as CheckIcon, 
  Storage as StorageIcon, 
  Backup as BackupIcon, 
  Security as SecurityIcon, 
  Payment as PaymentIcon,
  Computer as ComputerIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Plans definition
const plans = [
  { id: 1, name: 'Bronze', maxVMs: 1, maxBackups: 3, price: 9.99 },
  { id: 2, name: 'Silver', maxVMs: 3, maxBackups: 5, price: 19.99 },
  { id: 3, name: 'Gold', maxVMs: 5, maxBackups: 10, price: 29.99 },
  { id: 4, name: 'Platinum', maxVMs: 10, maxBackups: 20, price: 49.99 },
];

// Features definition
const features = [
  { icon: <StorageIcon />, text: 'Manage your Virtual Machines with ease' },
  { icon: <BackupIcon />, text: 'Create and manage VM backups' },
  { icon: <SecurityIcon />, text: 'Secure access with Single Sign-On (SSO)' },
  { icon: <PaymentIcon />, text: 'Flexible payment options' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [currentUserRole] = useState('admin'); // For demo purposes
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState(null);
  const [vms, setVms] = useState([
    { id: 1, name: 'VM1', user: 'user1' },
    { id: 2, name: 'VM2', user: 'user2' },
  ]);
  const [users] = useState(['user1', 'user2', 'user3']); // Mock user list
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [newVMName, setNewVMName] = useState('');
  const [selectedVM, setSelectedVM] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [backupSize, setBackupSize] = useState(0);

  const handleOpenDialog = (content) => {
    setDialogContent(content);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogContent(null);
    setNewVMName('');
    setSelectedVM('');
    setSelectedUser('');
    setBackupSize(0);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const createVM = () => {
    if (newVMName) {
      const newVM = { id: vms.length + 1, name: newVMName, user: currentUserRole === 'admin' ? 'admin' : 'currentUser' };
      setVms([...vms, newVM]);
      handleCloseDialog();
      showSnackbar(`VM "${newVMName}" created successfully`);
    }
  };

  const deleteVM = (vmId) => {
    const updatedVMs = vms.filter(vm => vm.id !== vmId);
    setVms(updatedVMs);
    showSnackbar(`VM deleted successfully`);
  };

  const moveVM = () => {
    if (selectedVM && selectedUser) {
      const updatedVMs = vms.map(vm => 
        vm.id === selectedVM ? { ...vm, user: selectedUser } : vm
      );
      setVms(updatedVMs);
      handleCloseDialog();
      showSnackbar(`VM moved to ${selectedUser}`);
      console.log(`VM ${selectedVM} moved to ${selectedUser}`); // Audit log
    }
  };

  const createBackup = () => {
    if (selectedVM && backupSize > 0) {
      const price = backupSize * 0.1; // Simple pricing calculation
      handleCloseDialog();
      showSnackbar(`Backup created for VM ${selectedVM}. Price: $${price.toFixed(2)}`);
      console.log(`Backup created for VM ${selectedVM}. Size: ${backupSize}GB, Price: $${price.toFixed(2)}`);
    }
  };

  const renderAdminActions = () => (
    <>
      <Button color="inherit" onClick={() => handleOpenDialog('createVM')}>Create VM</Button>
      <Button color="inherit" onClick={() => handleOpenDialog('manageVMs')}>Manage All VMs</Button>
      <Button color="inherit" onClick={() => handleOpenDialog('moveVM')}>Move VM between users</Button>
      <Button color="inherit" onClick={() => handleOpenDialog('trackActivities')}>Track User Activities</Button>
    </>
  );

  const renderStandardUserActions = () => (
    <>
      <Button color="inherit" onClick={() => handleOpenDialog('manageMyVMs')}>Manage My VMs</Button>
      <Button color="inherit" onClick={() => handleOpenDialog('createBackup')}>Create Backup</Button>
      <Button color="inherit" onClick={() => handleOpenDialog('viewBilling')}>View Billing Information</Button>
    </>
  );

  const renderDialogContent = () => {
    switch (dialogContent) {
      case 'createVM':
        return (
          <>
            <DialogTitle>Create New VM</DialogTitle>
            <DialogContent>
              <TextField 
                autoFocus 
                margin="dense" 
                label="VM Name" 
                fullWidth 
                value={newVMName}
                onChange={(e) => setNewVMName(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={createVM} disabled={!newVMName}>Create</Button>
            </DialogActions>
          </>
        );
      case 'manageVMs':
      case 'manageMyVMs':
        return (
          <>
            <DialogTitle>{dialogContent === 'manageVMs' ? 'Manage All VMs' : 'Manage My VMs'}</DialogTitle>
            <DialogContent>
              <List>
                {vms.filter(vm => dialogContent === 'manageVMs' || vm.user === 'currentUser').map(vm => (
                  <ListItem key={vm.id}>
                    <ListItemIcon>
                      <ComputerIcon />
                    </ListItemIcon>
                    <ListItemText primary={`${vm.name} (User: ${vm.user})`} />
                    <Button 
                      startIcon={<DeleteIcon />} 
                      onClick={() => deleteVM(vm.id)}
                      color="error"
                    >
                      Delete
                    </Button>
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        );
      case 'moveVM':
        return (
          <>
            <DialogTitle>Move VM between users</DialogTitle>
            <DialogContent>
              <FormControl fullWidth margin="dense">
                <InputLabel>Select VM</InputLabel>
                <Select
                  value={selectedVM}
                  onChange={(e) => setSelectedVM(e.target.value)}
                >
                  {vms.map(vm => (
                    <MenuItem key={vm.id} value={vm.id}>{vm.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>Select New User</InputLabel>
                <Select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  {users.map(user => (
                    <MenuItem key={user} value={user}>{user}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={moveVM} disabled={!selectedVM || !selectedUser}>Move</Button>
            </DialogActions>
          </>
        );
      case 'trackActivities':
        return (
          <>
            <DialogTitle>Track User Activities</DialogTitle>
            <DialogContent>
              <DialogContentText>
                User activity tracking would be displayed here. This could include:
                <List>
                  <ListItem>
                    <ListItemIcon><CheckIcon /></ListItemIcon>
                    <ListItemText primary="VM creation and deletion logs" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon /></ListItemIcon>
                    <ListItemText primary="User login/logout times" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon /></ListItemIcon>
                    <ListItemText primary="Resource usage statistics" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon /></ListItemIcon>
                    <ListItemText primary="Backup creation events" />
                  </ListItem>
                </List>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        );
      case 'createBackup':
        return (
          <>
            <DialogTitle>Create Backup</DialogTitle>
            <DialogContent>
              <FormControl fullWidth margin="dense">
                <InputLabel>Select VM</InputLabel>
                <Select
                  value={selectedVM}
                  onChange={(e) => setSelectedVM(e.target.value)}
                >
                  {vms.filter(vm => currentUserRole === 'admin' || vm.user === 'currentUser').map(vm => (
                    <MenuItem key={vm.id} value={vm.id}>{vm.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                label="Disk Size (GB)"
                type="number"
                fullWidth
                value={backupSize}
                onChange={(e) => setBackupSize(Number(e.target.value))}
              />
              {backupSize > 0 && (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Estimated price: ${(backupSize * 0.1).toFixed(2)}
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={createBackup} disabled={!selectedVM || backupSize <= 0}>Create Backup</Button>
            </DialogActions>
          </>
        );
      case 'viewBilling':
        return (
          <>
            <DialogTitle>Billing Information</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Your current plan: Gold
                <List>
                  <ListItem>
                    <ListItemIcon><CheckIcon /></ListItemIcon>
                    <ListItemText primary="Monthly fee: $29.99" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon /></ListItemIcon>
                    <ListItemText primary="VMs used: 3 out of 5" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon /></ListItemIcon>
                    <ListItemText primary="Backups used: 7 out of 10" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckIcon /></ListItemIcon>
                    <ListItemText primary="Additional charges this month: $5.50 (extra storage)" />
                  </ListItem>
                </List>
                Total due this month: $35.49
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        );
      default:
        return null;
    }
  };

  const handlePlanClick = (plan) => {
    navigate(`/payment`, { state: { plan } });
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Main Navigation */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            VM Management Platform
          </Typography>
          <Button color="inherit" onClick={handleLoginClick}>Login</Button>
          <Button color="inherit" onClick={handleSignupClick}>Sign Up</Button>
          <Button color="inherit" onClick={handleProfileClick}>Profile</Button>
          <Button color="inherit" onClick={handleLogoutClick}>Logout</Button>
        </Toolbar>
      </AppBar>

      {/* Role-based Actions in the Top Nav */}
      <AppBar position="static" color="default" sx={{ mt: 2 }}>
        <Toolbar>
          {currentUserRole === 'admin' ? renderAdminActions() : renderStandardUserActions()}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Welcome to VM Management Platform
        </Typography>
        
        <Typography variant="h6" gutterBottom align="center" color="text.secondary">
          Manage your Virtual Machines with ease and flexibility
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                {feature.icon}
                <Typography variant="body1" align="center" sx={{ mt: 2 }}>
                  {feature.text}
                </Typography>
              </Card>
              </Grid>
          ))}
        </Grid>

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 6, mb: 4 }} align="center">
          Choose Your Plan
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan) => (
            <Grid item key={plan.id} xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2" align="center">
                    {plan.name}
                  </Typography>
                  <Typography variant="h4" component="p" align="center" color="primary" sx={{ mb: 2 }}>
                    ${plan.price.toFixed(2)}
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={`Up to ${plan.maxVMs} VMs`} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={`${plan.maxBackups} backups included`} />
                    </ListItem>
                  </List>
                </CardContent>
                <CardActions>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="primary"
                    onClick={() => handlePlanClick(plan)}
                  >
                    Choose {plan.name}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6, mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom align="center">
            Why Choose Our VM Management Platform?
          </Typography>
          <Typography variant="body1" paragraph align="center">
            Our platform offers a comprehensive solution for managing your virtual machines. 
            With features like automated backups, easy VM creation and deletion, and flexible 
            subscription plans, we provide the tools you need to efficiently manage your 
            virtualized infrastructure.
          </Typography>
          <Typography variant="body1" paragraph align="center">
            Security is our top priority. We implement role-based access control and Single 
            Sign-On (SSO) to ensure that your data and resources are protected. Our intuitive 
            interface makes it easy to manage user roles and permissions, giving you complete 
            control over your environment.
          </Typography>
        </Box>
      </Container>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        {renderDialogContent()}
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HomePage;