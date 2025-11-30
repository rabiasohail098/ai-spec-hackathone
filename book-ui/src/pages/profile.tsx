import React from 'react';
import Layout from '@theme/Layout';

const ProfilePage = () => {
  // Check if we're in the browser (client-side) and if user is logged in by checking localStorage
  const isClient = typeof window !== 'undefined';

  let user = null;
  let isAuthenticated = false;

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

  if (!isAuthenticated || !user) {
    return (
      <Layout title="Profile" description="User profile page">
        <div className="container margin-vert--lg">
          <div className="row">
            <div className="col col--6 col--offset-3">
              <div className="card">
                <div className="card__header">
                  <h2>Access Denied</h2>
                </div>
                <div className="card__body">
                  <p>Please <a href="/signin">sign in</a> to view your profile.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile" description="Your Physical AI & Humanoid Robotics profile">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--6 col--offset-3">
            <div className="card">
              <div className="card__header">
                <h2>Your Profile</h2>
              </div>
              <div className="card__body">
                <div className="margin-bottom--md">
                  <strong>Name:</strong> {user.name}
                </div>
                <div className="margin-bottom--md">
                  <strong>Email:</strong> {user.email}
                </div>
                <div className="margin-bottom--md">
                  <strong>Member since:</strong> {new Date().toLocaleDateString()}
                </div>
              </div>
              <div className="card__footer">
                <p>Manage your account settings here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;