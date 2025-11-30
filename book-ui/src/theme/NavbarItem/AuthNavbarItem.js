// src/theme/NavbarItem/AuthNavbarItem.js
// This component is being removed as it causes context issues
// Instead, auth functionality is handled in the main Navbar component
// or through Docusaurus' native navigation configuration

import React from 'react';
import Link from '@docusaurus/Link';

// Simple auth-aware navigation item that doesn't use the context directly
const AuthNavbarItem = (props) => {
  // Check if user is logged in by checking localStorage
  const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('user') !== null;
  const user = isAuthenticated ? JSON.parse(localStorage.getItem('user')) : null;

  if (isAuthenticated && user) {
    return (
      <div className="navbar__item dropdown dropdown--right dropdown--username">
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
            <a
              className="dropdown__link"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // Call logout function
                localStorage.removeItem('user');
                window.location.href = '/';
              }}
            >
              Logout
            </a>
          </li>
        </ul>
      </div>
    );
  } else {
    // Return the regular sign in link
    return (
      <Link className="navbar__link" to="/signin">
        Sign In
      </Link>
    );
  }
};

export default AuthNavbarItem;