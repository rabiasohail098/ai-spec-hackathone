// src/AppWrapper.tsx
import React, { ReactNode } from 'react';
import { AuthProvider } from './contexts/AuthContext';

interface AppWrapperProps {
  children: ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

export default AppWrapper;