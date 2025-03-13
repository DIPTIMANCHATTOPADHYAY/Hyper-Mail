import { createClient } from '@supabase/supabase-js';
import { SECURITY } from '@/lib/constants';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Ensure URL is properly formatted
const formattedUrl = supabaseUrl.trim().replace(/\/$/, '');

// Enhanced security configuration
const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: window.localStorage,
    flowType: 'pkce', // More secure authentication flow
    // Set session timeout to 2 hours
    sessionTimeout: SECURITY.SESSION_TIMEOUT_HOURS * 60 * 60 // Convert hours to seconds
  },
  global: {
    headers: {
      'x-client-info': 'hyper-mail@1.0.0',
      'X-Request-ID': crypto.randomUUID(),
      'X-Client-Version': '1.0.0',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public'
  }
};

export const supabase = createClient(formattedUrl, supabaseAnonKey, supabaseConfig);

// Initialize session from URL if present
const initializeSession = async () => {
  try {
    const { error } = await supabase.auth.initialize();
    if (error) {
      console.error('Error initializing auth:', error);
    }

    // Set up auth state change listener
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        // Clear sensitive data
        localStorage.clear();
        sessionStorage.clear();
        
        // Keep only essential items
        const theme = localStorage.getItem('theme');
        if (theme) localStorage.setItem('theme', theme);
      }
    });

  } catch (error) {
    console.error('Failed to initialize auth:', error);
  }
};

initializeSession();

// Export secure helper functions
export const secureHelpers = {
  sanitizeInput: (input: string): string => {
    return input.replace(/[<>]/g, ''); // Basic XSS prevention
  },
  
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  },
  
  hashData: async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
};