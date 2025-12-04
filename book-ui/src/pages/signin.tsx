import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useHistory, useLocation } from '@docusaurus/router';
import { useAuth } from '../contexts/AuthContext';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';

export default function SigninPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, isAuthenticated, isInitialized } = useAuth();
  const history = useHistory();
  const location = useLocation();

  // Check if user just registered
  const registered = location.state?.registered;

  // If already authenticated, redirect to profile
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      history.push('/profile');
    }
  }, [isInitialized, isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const success = await login(formData.email, formData.password);

    if (!success) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
    // The useEffect will automatically redirect to /profile once isAuthenticated is true
  };

  return (
    <Layout title="Sign In" description="Sign in to access personalized content">
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 0',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          backgroundColor: 'var(--ifm-background-color)',
        }}>
          <h1 style={{textAlign: 'center', marginBottom: '2rem', color: 'var(--ifm-color-primary)'}}>Sign In</h1>

          {registered && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#efe',
              color: '#363',
              border: '1px solid #cfc',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              Account created successfully! Please sign in to continue.
            </div>
          )}

          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fee',
              color: '#c33',
              border: '1px solid #fcc',
              borderRadius: '6px',
              marginBottom: '1.5rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{marginBottom: '1.5rem'}}>
              <label htmlFor="email" style={{display: 'block', marginBottom: '.5rem'}}>Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  backgroundColor: 'var(--ifm-background-color)',
                  color: 'var(--ifm-font-color-base)'
                }}
              />
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <label htmlFor="password" style={{display: 'block', marginBottom: '.5rem'}}>Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  backgroundColor: 'var(--ifm-background-color)',
                  color: 'var(--ifm-font-color-base)'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: loading ? '#ccc' : 'var(--ifm-color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1.1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s'
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p style={{textAlign: 'center', marginTop: '1.5rem'}}>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>

          <div style={{marginTop: '2rem', textAlign: 'center'}}>
            <Link to="/forgot-password" style={{color: 'var(--ifm-color-primary)'}}>
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}