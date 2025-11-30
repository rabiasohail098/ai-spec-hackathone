// src/components/ProtectedRoute.tsx
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if we're in the browser (client-side) and if user is logged in by checking localStorage
  const isClient = typeof window !== 'undefined';

  let isAuthenticated = false;
  if (isClient) {
    const storedUser = localStorage.getItem('user');
    isAuthenticated = storedUser !== null;
  }

  const history = useHistory();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with the current location as state
    if (isClient) {
      history.push('/signin', { from: location });
    }
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;