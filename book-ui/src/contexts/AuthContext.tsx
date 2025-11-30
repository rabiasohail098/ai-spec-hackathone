// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on initial load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call to login
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, you would verify credentials with your backend
        // For this example, we'll just create a mock user
        if (email && password) { // Simple check - in real app, verify with backend
          const mockUser: User = {
            id: '1',
            name: email.split('@')[0], // Use part of email as name for mock
            email: email,
          };
          
          setUser(mockUser);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(mockUser));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Remove any stored token
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call to register
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, you would send registration data to your backend
        if (name && email && password) {
          // For this example, we'll just create a mock user after registration
          const mockUser: User = {
            id: '2', // Different ID for new user
            name: name,
            email: email,
          };
          
          setUser(mockUser);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(mockUser));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};