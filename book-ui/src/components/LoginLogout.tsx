// src/components/LoginLogout.tsx
import React from 'react';
import Link from '@docusaurus/Link';
import { useAuth } from '../contexts/AuthContext';

const LoginLogout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Navigate to home after logout
    window.location.href = '/';
  };

  if (isAuthenticated && user) {
    const displayName = user.first_name || user.email.split('@')[0];
    return (
      <div className="navbar__item dropdown dropdown--right dropdown--username">
        <span className="navbar__link">
          Hello, {displayName}!
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