// frontend/src/components/Logout.js

import React from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate instead of useHistory

const Logout = () => {
  const navigate = useNavigate(); // useNavigate instead of useHistory

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear JWT token
    navigate('/login'); // Redirect to login page using navigate
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
};

export default Logout;
