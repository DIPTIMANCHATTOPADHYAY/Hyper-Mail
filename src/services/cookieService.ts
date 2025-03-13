import Cookies from 'js-cookie';
import { Account } from '@/types';
import { COOKIE_KEYS, SECURITY } from '@/lib/constants';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true, // Necessary cookies are always enabled
  analytics: false,
  marketing: false
};

// Convert hours to decimal days for js-cookie expiry
const HOURS_TO_DAYS = (hours: number) => hours / 24;

export const cookieService = {
  // Get cookie preferences
  getPreferences(): CookiePreferences {
    try {
      const prefs = localStorage.getItem(COOKIE_KEYS.PREFERENCES);
      return prefs ? JSON.parse(prefs) : DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Failed to get cookie preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  },

  // Check if cookies are accepted
  areCookiesAccepted(): boolean {
    return this.getPreferences().necessary === true;
  },

  // Set email session with 2-hour expiry
  setEmailSession(session: Account) {
    try {
      // Always allow necessary cookies
      Cookies.set(COOKIE_KEYS.EMAIL_SESSION, JSON.stringify(session), {
        expires: HOURS_TO_DAYS(SECURITY.SESSION_TIMEOUT_HOURS), // 2 hours
        secure: true,
        sameSite: 'strict'
      });

      // Set a timeout to automatically clear the session
      setTimeout(() => {
        this.clearEmailSession();
        // Dispatch a custom event to notify the application
        window.dispatchEvent(new CustomEvent('sessionExpired'));
      }, SECURITY.SESSION_TIMEOUT_HOURS * 60 * 60 * 1000); // Convert hours to milliseconds
    } catch (error) {
      console.error('Failed to set email session:', error);
      throw error;
    }
  },

  // Get email session
  getEmailSession(): Account | null {
    try {
      const session = Cookies.get(COOKIE_KEYS.EMAIL_SESSION);
      if (!session) return null;
      
      const parsedSession = JSON.parse(session);
      
      // Validate session structure
      if (!parsedSession.email_addr || !parsedSession.sid_token) {
        this.clearEmailSession();
        return null;
      }
      
      return parsedSession;
    } catch (error) {
      console.error('Failed to get email session:', error);
      this.clearEmailSession();
      return null;
    }
  },

  // Clear email session
  clearEmailSession() {
    try {
      Cookies.remove(COOKIE_KEYS.EMAIL_SESSION);
      window.dispatchEvent(new CustomEvent('sessionCleared'));
    } catch (error) {
      console.error('Failed to clear email session:', error);
    }
  },

  // Check if session is expired
  isSessionExpired(): boolean {
    const session = Cookies.get(COOKIE_KEYS.EMAIL_SESSION);
    return !session;
  },

  // Refresh session if it exists (reset expiry timer)
  refreshSession() {
    const session = this.getEmailSession();
    if (session) {
      this.setEmailSession(session);
    }
  }
};