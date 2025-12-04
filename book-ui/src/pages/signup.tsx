import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { useHistory, useLocation } from '@docusaurus/router';
import { useAuth } from '../contexts/AuthContext';
import { useBaseUrlUtils } from '@docusaurus/useBaseUrl';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    softwareBackground: '',
    hardwareBackground: '',
    interests: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const history = useHistory();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    const success = await register(
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.password,
      formData.softwareBackground,
      formData.hardwareBackground
    );

    if (success) {
      // After successful registration, navigate to the sign-in page
      history.push('/signin', { registered: true });
    } else {
      setError("Registration failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <Layout title="Sign Up" description="Create an account to access personalized content">
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 0',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          backgroundColor: 'var(--ifm-background-color)',
        }}>
          <h1 style={{textAlign: 'center', marginBottom: '2rem', color: 'var(--ifm-color-primary)'}}>Create Account</h1>

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
              <label htmlFor="firstName" style={{display: 'block', marginBottom: '.5rem'}}>First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
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
              <label htmlFor="lastName" style={{display: 'block', marginBottom: '.5rem'}}>Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
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
              <label htmlFor="email" style={{display: 'block', marginBottom: '.5rem'}}>Email Address *</label>
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
              <label htmlFor="password" style={{display: 'block', marginBottom: '.5rem'}}>Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
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
              <label htmlFor="confirmPassword" style={{display: 'block', marginBottom: '.5rem'}}>Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
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
              <label htmlFor="softwareBackground" style={{display: 'block', marginBottom: '.5rem'}}>Software Background</label>
              <textarea
                id="softwareBackground"
                name="softwareBackground"
                value={formData.softwareBackground}
                onChange={handleChange}
                placeholder="Describe your software development experience, programming languages you know, etc."
                rows={3}
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
              <label htmlFor="hardwareBackground" style={{display: 'block', marginBottom: '.5rem'}}>Hardware Background</label>
              <textarea
                id="hardwareBackground"
                name="hardwareBackground"
                value={formData.hardwareBackground}
                onChange={handleChange}
                placeholder="Describe your hardware experience, robotics, electronics, etc."
                rows={3}
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{textAlign: 'center', marginTop: '1.5rem'}}>
            Already have an account? <Link to="/signin">Sign In</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}