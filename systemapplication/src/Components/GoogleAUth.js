import React from 'react';
import { Button } from '@mui/material';

const GoogleAuth = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleGoogleLogin}
    >
      Sign in with Google
    </Button>
  );
};

export default GoogleAuth;