// src/theme/Navbar/index.js
import React, { useState, useEffect } from 'react';
import OriginalNavbar from '@theme-original/Navbar';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';

const NavbarWrapper = (props) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth state from localStorage and set up event listener for storage changes
  useEffect(() => {
    // Function to update auth state from localStorage
    const updateAuthState = () => {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Failed to parse user from localStorage', error);
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    };

    // Update auth state on initial load
    updateAuthState();

    // Set up event listener for storage changes (from other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        updateAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Return cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Only show auth elements on non-auth pages
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      // Trigger a window storage event so other components can update
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user',
        oldValue: JSON.stringify(user),
        newValue: null
      }));
      // Reload the page to ensure all components update
      window.location.href = '/';
    }
  };

  return (
    <>
      <OriginalNavbar {...props} />
      {!isAuthPage && typeof window !== 'undefined' && (
        <div
          className="navbar__item"
          style={{ position: 'absolute', right: '100px', top: '50%', transform: 'translateY(-50%)' }}
        >
          {isAuthenticated && user ? (
            <div className="dropdown dropdown--right dropdown--username">
              <span className="navbar__link dropdown__right">
                {user.name}
              </span>
              <ul className="dropdown__menu">
                <li>
                  <Link className="dropdown__link" to="/profile">
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    className="dropdown__link logout-button"
                    onClick={handleLogout}
                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link className="navbar__link" to="/signin">
              Sign In
            </Link>
          )}
        </div>
      )}
    </>
  );
};

export default NavbarWrapper;