// src/AppWrapper.tsx
import React, { ReactNode } from 'react';

interface AppWrapperProps {
  children: ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  return (
    <>
      {children}
    </>
  );
};

export default AppWrapper;