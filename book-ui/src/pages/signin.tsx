import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { useHistory, useLocation } from 'react-router-dom'; // Docusaurus uses older react-router APIs

const SignInPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const history = useHistory();
  const location = useLocation();

  // Get the redirect path from state or default to home
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Simulate API call to authenticate user
    try {
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In this example, we'll create a mock user based on the login
      // In a real application, you would receive a user object from your backend
      const mockUser = {
        id: '1', // This would come from your API response
        name: formData.email.split('@')[0], // Use part of email as name
        email: formData.email,
      };

      // Store user data in localStorage to simulate authentication
      localStorage.setItem('user', JSON.stringify(mockUser));

      // After successful login, redirect to the original destination or home
      // Force a page reload to ensure all components update with the new auth state
      window.location.href = from;
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Invalid email or password. Please try again.' });
    }
  };

  return (
    <Layout title="Sign In" description="Sign in to your Physical AI & Humanoid Robotics account">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--6 col--offset-3">
            <div className="card" style={{ background: 'var(--ifm-color-emphasis-100)', border: '1px solid var(--ifm-color-emphasis-200)' }}>
              <div className="card__header text--center" style={{ paddingBottom: '1.5rem' }}>
                <h2 style={{ color: '#25c2a0', fontWeight: 'bold' }}>Sign In to Your Account</h2>
                <p style={{ color: 'var(--ifm-color-emphasis-600)', marginBottom: 0 }}>Access your Physical AI & Humanoid Robotics resources</p>
              </div>
              <div className="card__body" style={{ padding: '2rem' }}>
                {errors.general && (
                  <div className="alert alert--danger margin-bottom--md" style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                    {errors.general}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="margin-bottom--lg">
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--ifm-color-emphasis-800)' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      style={{
                        padding: '0.75rem 1rem',
                        fontSize: '1rem',
                        border: '1px solid var(--ifm-color-emphasis-300)',
                        borderRadius: 'var(--ifm-global-radius)',
                        width: '100%',
                        background: 'var(--ifm-background-surface-color)'
                      }}
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <div className="alert alert--danger margin-top--sm" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <div className="margin-bottom--lg">
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--ifm-color-emphasis-800)' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="form-control"
                      style={{
                        padding: '0.75rem 1rem',
                        fontSize: '1rem',
                        border: '1px solid var(--ifm-color-emphasis-300)',
                        borderRadius: 'var(--ifm-global-radius)',
                        width: '100%',
                        background: 'var(--ifm-background-surface-color)'
                      }}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && (
                      <div className="alert alert--danger margin-top--sm" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>
                        {errors.password}
                      </div>
                    )}
                  </div>

                  <div className="margin-bottom--lg" style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      style={{ marginRight: '0.5rem', width: '1rem', height: '1rem' }}
                    />
                    <label
                      htmlFor="rememberMe"
                      style={{ margin: 0, fontWeight: 'normal', color: 'var(--ifm-color-emphasis-700)' }}
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="margin-bottom--md">
                    <button
                      type="submit"
                      className="button button--primary button--block"
                      style={{
                        padding: '0.75rem 1rem',
                        fontSize: '1rem',
                        background: '#25c2a0',
                        borderColor: '#25c2a0',
                        borderRadius: 'var(--ifm-global-radius)',
                        fontWeight: 'bold',
                        width: '100%'
                      }}
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              </div>
              <div className="card__footer text--center" style={{ paddingTop: '1rem' }}>
                <p className="margin-bottom--sm">
                  Don't have an account?{' '}
                  <a href="/signup" style={{ color: '#25c2a0', fontWeight: '500' }}>Sign up here</a>
                </p>
                <p>
                  <a href="#forgot-password" style={{ color: '#25c2a0', fontWeight: '500' }}>Forgot password?</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignInPage;