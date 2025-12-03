// src/theme/Root.tsx
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ChatProvider } from '../contexts/ChatContext';
import KeyboardNavigationInjector from '../components/KeyboardNavigationInjector';
import ErrorBoundary from '../components/ErrorBoundary';

// Default implementation, that you can customize
function Root({ children }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ChatProvider>
          <KeyboardNavigationInjector />
          {children}
        </ChatProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default Root;