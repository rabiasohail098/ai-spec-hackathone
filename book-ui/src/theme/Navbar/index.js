// src/theme/Navbar/index.js
import React, { useState, useEffect } from "react";
import OriginalNavbar from "@theme-original/Navbar";
import Link from "@docusaurus/Link";
import { useLocation } from "@docusaurus/router";

const NavbarWrapper = (props) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth state from localStorage and set up event listener for storage changes
  useEffect(() => {
    // Function to update auth state from localStorage
    const updateAuthState = () => {
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
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
      if (e.key === "user" || e.key === "token") {
        updateAuthState();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Return cleanup function
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Only show auth elements on non-auth pages
  const isAuthPage =
    location.pathname === "/signin" || location.pathname === "/signup";

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Trigger a custom event for the AuthContext to handle
      window.dispatchEvent(new Event('userLoggedOut'));
      // Redirect to home
      window.location.href = "/";
    }
  };

  // Create a custom navbar item for auth
  const customNavbarItem = !isAuthPage ? (
    <div className="navbar__item navbar__item--right" style={{ display: 'flex', alignItems: 'center' }}>
      {isAuthenticated ? (
        <div className="dropdown dropdown--right dropdown--navbar">
          <span className="navbar__link dropdown__trigger">
            {user.first_name || user.email.split('@')[0]} ▼
          </span>
          <ul className="dropdown__menu">
            <li>
              <Link className="dropdown__link" to="/profile">Profile</Link>
            </li>
            <li>
              <a
                className="dropdown__link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                Sign Out
              </a>
            </li>
          </ul>
        </div>
      ) : (
        <Link className="button button--primary button--sm" to="/signin">Sign In</Link>
      )}
    </div>
  ) : null;

  // Add the custom item to the original navbar items
  const modifiedProps = {
    ...props,
    items: props.items ? [...props.items, customNavbarItem] : [customNavbarItem]
  };

  return (
    <>
      <OriginalNavbar {...modifiedProps} />
    </>
  );
};

export default NavbarWrapper;
