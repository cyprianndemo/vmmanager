import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, List, ListItem,
  ListItemText, ListItemSecondaryAction, IconButton, CircularProgress, Snackbar
} from '@mui/material';
import { PlayArrow, Stop, Delete, Backup as BackupIcon } from '@mui/icons-material';
import { Alert } from '@mui/material';

const VMManagement = () => {
  const [vms, setVMs] = useState([]);
  const [role, setRole] = useState('Guest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserRole();
    fetchVMs();
  }, []);

  const fetchUserRole = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/user/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setRole(response.data.role);
    } catch (error) {
      setError('Error fetching user role');
    } finally {
      setLoading(false);
    }
  };

  const fetchVMs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/vms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setVMs(response.data);
    } catch (error) {
      setError('Error fetching VMs');
    } finally {
      setLoading(false);
    }
  };

  const startVM = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/vms/${id}/start`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchVMs();
    } catch (error) {
      setError('Error starting VM');
    } finally {
      setLoading(false);
    }
  };

  const stopVM = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/vms/${id}/stop`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchVMs();
    } catch (error) {
      setError('Error stopping VM');
    } finally {
      setLoading(false);
    }
  };

  const deleteVM = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/vms/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchVMs();
    } catch (error) {
      setError('Error deleting VM');
    } finally {
      setLoading(false);
    }
  };

  const backupVM = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/vms/${id}/backup`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchVMs();
    } catch (error) {
      setError('Error backing up VM');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        VM Management
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {vms.map((vm) => (
            <ListItem key={vm._id}>
              <ListItemText
                primary={vm.name}
                secondary={`Status: ${vm.status} | CPU: ${vm.specs.cpu} | RAM: ${vm.specs.ram}GB | Storage: ${vm.specs.storage}GB | Created: ${new Date(vm.createdAt).toLocaleDateString()} | Last Backup: ${vm.lastBackup ? new Date(vm.lastBackup).toLocaleDateString() : 'Never'}`}
              />
              <ListItemSecondaryAction>
                {(role === 'Admin' || role === 'Standard') && (
                  <>
                    <IconButton edge="end" aria-label="start" onClick={() => startVM(vm._id)} disabled={vm.status === 'Running'}>
                      <PlayArrow />
                    </IconButton>
                    <IconButton edge="end" aria-label="stop" onClick={() => stopVM(vm._id)} disabled={vm.status === 'Stopped'}>
                      <Stop />
                    </IconButton>
                    <IconButton edge="end" aria-label="backup" onClick={() => backupVM(vm._id)}>
                      <BackupIcon />
                    </IconButton>
                  </>
                )}
                {role === 'Admin' && (
                  <IconButton edge="end" aria-label="delete" onClick={() => deleteVM(vm._id)}>
                    <Delete />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
};

export default VMManagement;
