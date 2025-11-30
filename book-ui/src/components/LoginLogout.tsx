// src/components/LoginLogout.tsx
import React from 'react';
import Link from '@docusaurus/Link';

const LoginLogout: React.FC = () => {
  // Check if we're in the browser (client-side) and if user is logged in by checking localStorage
  const isClient = typeof window !== 'undefined';

  let isAuthenticated = false;
  let user = null;

  if (isClient) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        user = JSON.parse(storedUser);
        isAuthenticated = true;
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('user');
      }
    }
  }

  const handleLogout = () => {
    if (isClient) {
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

  if (isAuthenticated && user) {
    return (
      <div className="navbar__item dropdown dropdown--right dropdown--username">
        <span className="navbar__link">
          Hello, {user.name}!
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
    );
  }

  return (
    <div className="navbar__item">
      <Link className="navbar__link" to="/signin">
        Sign In
      </Link>
    </div>
  );
};

export default LoginLogout;