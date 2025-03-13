// Application constants
export const APP_VERSION = '1.0.0';
export const APP_NAME = 'Hyper Mail';
export const APP_DESCRIPTION = 'Secure, temporary email service for your privacy needs.';

// API endpoints
export const API_ENDPOINTS = {
  CREATE_EMAIL: '/api/email/create',
  GET_EMAILS: '/api/email/list',
  GET_EMAIL_CONTENT: '/api/email/content',
  DELETE_EMAIL: '/api/email/delete'
} as const;

// Security constants
export const SECURITY = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_TIMEOUT_MINUTES: 30,
  SESSION_TIMEOUT_HOURS: 2, // Updated from 24 to 2 hours
  PASSWORD_MIN_LENGTH: 12
} as const;

// Cookie constants
export const COOKIE_KEYS = {
  EMAIL_SESSION: 'email_session',
  PREFERENCES: 'cookie-preferences',
  THEME: 'theme'
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  SETTINGS: 'site_settings',
  AUTH_TOKEN: 'supabase.auth.token'
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  ADMIN: '/admin',
  SETTINGS: '/settings'
} as const;