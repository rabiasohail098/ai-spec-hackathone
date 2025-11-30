// src/theme/Layout.tsx
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import OriginalLayout from '@theme-original/Layout';

export default function Layout(props) {
  return (
    <AuthProvider>
      <OriginalLayout {...props} />
    </AuthProvider>
  );
}