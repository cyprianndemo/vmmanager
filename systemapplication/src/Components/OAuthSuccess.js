import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const role = params.get('role');

    if (token && role) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      setTimeout(() => {
        if (role === 'Admin') {
          navigate('/admin/dashboard');
        } else if (role === 'Standard') {
          navigate('/dashboard');
        } else {
          navigate('/guest-dashboard');
        }
      }, 1000);
    } else {
      navigate('/login');
    }
  }, [navigate, location]);

  return (
    <div>
      <h2>Authentication Successful</h2>
      <p>Redirecting you to the appropriate dashboard...</p>
    </div>
  );
};

export default OAuthSuccess;