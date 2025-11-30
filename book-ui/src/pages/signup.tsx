import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { useHistory } from 'react-router-dom'; // Docusaurus uses older react-router APIs

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const history = useHistory();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Simulate API call to register user
    try {
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In this example, we'll create a mock user based on the registration
      // In a real application, you would receive a user object from your backend
      const mockUser = {
        id: '2', // This would come from your API response
        name: formData.name,
        email: formData.email,
      };

      // Store user data in localStorage to simulate authentication
      localStorage.setItem('user', JSON.stringify(mockUser));

      // After successful registration and login, redirect to home
      // Force a page reload to ensure all components update with the new auth state
      window.location.href = '/';
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <Layout title="Sign Up" description="Create an account for Physical AI & Humanoid Robotics">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--6 col--offset-3">
            <div className="card" style={{ background: 'var(--ifm-color-emphasis-100)', border: '1px solid var(--ifm-color-emphasis-200)' }}>
              <div className="card__header text--center" style={{ paddingBottom: '1.5rem' }}>
                <h2 style={{ color: '#25c2a0', fontWeight: 'bold' }}>Create an Account</h2>
                <p style={{ color: 'var(--ifm-color-emphasis-600)', marginBottom: 0 }}>Join our Physical AI & Humanoid Robotics community</p>
              </div>
              <div className="card__body" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit}>
                  <div className="margin-bottom--lg">
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--ifm-color-emphasis-800)' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      style={{
                        padding: '0.75rem 1rem',
                        fontSize: '1rem',
                        border: '1px solid var(--ifm-color-emphasis-300)',
                        borderRadius: 'var(--ifm-global-radius)',
                        width: '100%',
                        background: 'var(--ifm-background-surface-color)'
                      }}
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <div className="alert alert--danger margin-top--sm" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>
                        {errors.name}
                      </div>
                    )}
                  </div>

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

                  <div className="margin-bottom--lg">
                    <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--ifm-color-emphasis-800)' }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-control"
                      style={{
                        padding: '0.75rem 1rem',
                        fontSize: '1rem',
                        border: '1px solid var(--ifm-color-emphasis-300)',
                        borderRadius: 'var(--ifm-global-radius)',
                        width: '100%',
                        background: 'var(--ifm-background-surface-color)'
                      }}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && (
                      <div className="alert alert--danger margin-top--sm" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>
                        {errors.confirmPassword}
                      </div>
                    )}
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
                      Create Account
                    </button>
                  </div>
                </form>
              </div>
              <div className="card__footer text--center" style={{ paddingTop: '1rem' }}>
                <p className="margin-bottom--sm">
                  Already have an account?{' '}
                  <a href="/signin" style={{ color: '#25c2a0', fontWeight: '500' }}>Sign in here</a>
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-600)' }}>
                  By signing up, you agree to our <a href="#" style={{ color: '#25c2a0' }}>Terms of Service</a> and <a href="#" style={{ color: '#25c2a0' }}>Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignUpPage;