// src/components/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory, useLocation } from '@docusaurus/router';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const history = useHistory();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with the current location as state
    history.push('/signin', { from: location });
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;