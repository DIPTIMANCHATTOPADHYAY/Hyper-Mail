import { supabase, secureHelpers } from './supabaseClient';
import { cookieManagementService } from './cookieManagementService';

const PASSWORD_REQUIREMENTS = {
  minLength: 12, // Increased from 8 to 12
  requireNumbers: true,
  requireSpecialChars: true,
  requireUppercase: true,
  requireLowercase: true,
  requireNonSequential: true // New requirement
};

function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireNonSequential) {
    // Check for sequential characters
    const sequential = '01234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < password.length - 2; i++) {
      const fragment = password.slice(i, i + 3);
      if (sequential.includes(fragment)) {
        errors.push('Password must not contain sequential characters');
        break;
      }
    }
  }

  // Check for common passwords
  const commonPasswords = ['password', 'admin123', '123456', 'qwerty'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export const authService = {
  async signUp(email: string, password: string, firstName: string, lastName: string, asAdmin: boolean = false) {
    // Validate email
    if (!secureHelpers.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Sanitize inputs
    firstName = secureHelpers.sanitizeInput(firstName);
    lastName = secureHelpers.sanitizeInput(lastName);

    // Validate password
    const { isValid, errors } = validatePassword(password);
    if (!isValid) {
      throw new Error(['Password does not meet requirements:', ...errors].join('\n'));
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          is_admin: asAdmin,
          full_name: `${firstName} ${lastName}`
        },
        emailRedirectTo: `${window.location.origin}${asAdmin ? '/admin' : ''}`
      }
    });

    if (error) {
      console.error('Signup error:', error);
      throw new Error(error.message);
    }

    return data;
  },

  async signIn(email: string, password: string) {
    // Add brute force protection
    const attemptKey = `login_attempts_${await secureHelpers.hashData(email)}`;
    const attempts = parseInt(localStorage.getItem(attemptKey) || '0');
    const lastAttempt = parseInt(localStorage.getItem(`${attemptKey}_time`) || '0');
    const now = Date.now();

    // Reset attempts after 30 minutes
    if (now - lastAttempt > 30 * 60 * 1000) {
      localStorage.setItem(attemptKey, '0');
    } else if (attempts >= 5) {
      const waitTime = Math.ceil((30 * 60 * 1000 - (now - lastAttempt)) / 1000 / 60);
      throw new Error(`Too many login attempts. Please try again in ${waitTime} minutes.`);
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Reset login attempts on successful login
      localStorage.removeItem(attemptKey);
      localStorage.removeItem(`${attemptKey}_time`);

      // After successful login, restore previous cookies if they exist
      try {
        const storedCookies = await cookieManagementService.getStoredCookies(data.user.id);
        if (storedCookies?.cookies) {
          cookieManagementService.restoreCookies(storedCookies.cookies);
        }
      } catch (error) {
        console.error('Failed to restore cookies:', error);
      }

      return data;
    } catch (error) {
      // Increment login attempts
      localStorage.setItem(attemptKey, (attempts + 1).toString());
      localStorage.setItem(`${attemptKey}_time`, now.toString());
      
      console.error('Login error:', error);
      throw new Error('Invalid email or password');
    }
  },

  async signOut() {
    try {
      // Get current user before signing out
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Save current cookies before clearing them
        await cookieManagementService.saveCookies(user.id);
      }

      // Sign out and clear cookies
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear all sensitive data
      cookieManagementService.clearAllCookies();
      localStorage.clear();
      sessionStorage.clear();
      
      // Preserve theme preference
      const theme = localStorage.getItem('theme');
      if (theme) localStorage.setItem('theme', theme);

      // Clear any stored login attempts
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('login_attempts_')) {
          localStorage.removeItem(key);
        }
      });

      // Redirect to home page and refresh
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  async resetPassword(email: string) {
    if (!secureHelpers.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    const { isValid, errors } = validatePassword(newPassword);
    if (!isValid) {
      throw new Error(['Password does not meet requirements:', ...errors].join('\n'));
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  },

  async deleteAccount() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('No user found');
    }

    // Save cookies before deleting account
    try {
      await cookieManagementService.saveCookies(user.id);
    } catch (error) {
      console.error('Failed to save cookies before account deletion:', error);
    }

    const { error } = await supabase.rpc('delete_user', {
      user_id: user.id
    });

    if (error) {
      throw new Error('Failed to delete account. Please try again later.');
    }

    // Clear all sensitive data
    cookieManagementService.clearAllCookies();
    localStorage.clear();
    sessionStorage.clear();
    
    // Preserve theme preference
    const theme = localStorage.getItem('theme');
    if (theme) localStorage.setItem('theme', theme);
    
    // Redirect to home page and refresh
    window.location.href = '/';
  },

  async refreshSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
    return session;
  },

  getCurrentUser() {
    return supabase.auth.getUser();
  },

  getCurrentSession() {
    return supabase.auth.getSession();
  },

  // New method to validate session security
  async validateSessionSecurity() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    // Check if session is expired
    const expiresAt = new Date(session.expires_at || 0).getTime();
    if (Date.now() >= expiresAt) {
      await this.signOut();
      return false;
    }

    return true;
  }
};