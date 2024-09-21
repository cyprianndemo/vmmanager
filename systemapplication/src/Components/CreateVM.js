import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography } from '@mui/material';

const CreateVM = () => {
  const [name, setName] = useState('');
  const [cpu, setCpu] = useState('');
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');

  const createVM = async () => {
    try {
      const token = localStorage.getItem('token');
      const vmData = {
        name,
        specs: {
          cpu: parseInt(cpu),
          ram: parseInt(ram),
          storage: parseInt(storage),
        },
      };
      await axios.post('http://localhost:5000/api/vms', vmData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Clear form and show success message (optional)
    } catch (error) {
      console.error('Error creating VM:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4">Create a New VM</Typography>
      <TextField label="VM Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth margin="normal" />
      <TextField label="CPU" value={cpu} onChange={(e) => setCpu(e.target.value)} fullWidth margin="normal" />
      <TextField label="RAM (GB)" value={ram} onChange={(e) => setRam(e.target.value)} fullWidth margin="normal" />
      <TextField label="Storage (GB)" value={storage} onChange={(e) => setStorage(e.target.value)} fullWidth margin="normal" />
      <Button variant="contained" color="primary" onClick={createVM}>Create VM</Button>
    </Container>
  );
};

export default CreateVM;
