// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (firstName: string, lastName: string, email: string, password: string, softwareBackground?: string, hardwareBackground?: string) => Promise<boolean>;
  updateUserProfile: (firstName: string, lastName: string) => Promise<boolean>;
  isAuthenticated: boolean;
  token: string | null;
  isInitialized: boolean;
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

// API base URL
const API_BASE_URL = typeof window !== 'undefined'
  ? (window as any).env?.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'production'
      ? `${window.location.origin}/api/v1` // For GitHub Pages deployment
      : 'http://localhost:8000/api/v1') // For local development
  : 'http://localhost:8000/api/v1';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if user is logged in on initial load
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to parse user from localStorage', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsInitialized(true);
    };

    initializeAuth();

    // Listen for logout events from other parts of the app (like Navbar)
    const handleLogoutEvent = () => {
      setUser(null);
      setIsAuthenticated(false);
      setToken(null);
    };

    window.addEventListener('userLoggedOut', handleLogoutEvent);

    return () => {
      window.removeEventListener('userLoggedOut', handleLogoutEvent);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { access_token } = data;

        // Get user info using the token
        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();

          // Store token and user in localStorage
          localStorage.setItem('token', access_token);
          localStorage.setItem('user', JSON.stringify(userData.user));

          setToken(access_token);
          setUser(userData.user);
          setIsAuthenticated(true);

          return true;
        } else {
          throw new Error('Failed to get user info');
        }
      } else {
        const errorData = await response.json();
        console.error('Login error:', errorData.detail || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    softwareBackground?: string,
    hardwareBackground?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          software_background: softwareBackground,
          hardware_background: hardwareBackground
        }),
      });

      if (response.ok) {
        // Automatically log the user in after successful registration
        const loginSuccess = await login(email, password);
        return loginSuccess;
      } else {
        const errorData = await response.json();
        console.error('Registration error:', errorData.detail || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const updateUserProfile = async (firstName: string, lastName: string): Promise<boolean> => {
    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();

        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Update context
        setUser(updatedUser);

        return true;
      } else {
        const errorData = await response.json();
        console.error('Profile update error:', errorData.detail || 'Failed to update profile');
        return false;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUserProfile, isAuthenticated, token, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};