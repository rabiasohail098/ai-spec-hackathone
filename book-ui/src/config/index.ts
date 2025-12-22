/**
 * Application Configuration
 *
 * Centralized configuration for the frontend application.
 * Environment-specific settings for development and production.
 */

// Production backend URL (Hugging Face Spaces)
const PRODUCTION_BACKEND_URL = 'https://rabiasohail098-robotics-backend.hf.space';

const getBackendUrl = (): string => {
  if (process.env.REACT_APP_BACKEND_URL) return process.env.REACT_APP_BACKEND_URL;
  if (process.env.NEXT_PUBLIC_BACKEND_URL) return process.env.NEXT_PUBLIC_BACKEND_URL;
  if (typeof window !== 'undefined' && (window as any).env?.BACKEND_URL) {
    return (window as any).env.BACKEND_URL;
  }
  // For localhost development
  if (typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8002';
  }
  // Production (GitHub Pages)
  return PRODUCTION_BACKEND_URL;
};

export const config = {
  // Backend API URL
  backendUrl: getBackendUrl(),

  // API endpoints
  api: {
    chat: '/api/v1/chat',
    auth: '/api/v1/auth',
    translate: '/api/v1/translate',
    personalize: '/api/v1/personalize',
  },

  // Feature flags
  features: {
    translation: true,
    personalization: true,
    textToSpeech: true,
  },
};

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('[Config] Application configuration:', config);
}

export default config;
