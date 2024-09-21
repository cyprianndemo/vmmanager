// frontend/src/components/GitHubAuth.js

import React from 'react';

const GitHubAuth = () => {
  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/github';
  };

  return (
    <button onClick={handleGitHubLogin}>Sign in with GitHub</button>
  );
};

export default GitHubAuth;
