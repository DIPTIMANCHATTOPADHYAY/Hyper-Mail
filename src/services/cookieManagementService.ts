import { supabase } from './supabaseClient';
import Cookies from 'js-cookie';

interface StoredCookies {
  id: string;
  user_id: string;
  cookies: Record<string, string>;
  created_at: string;
}

export const cookieManagementService = {
  // Get all cookies from browser
  getAllCookies(): Record<string, string> {
    const cookies: Record<string, string> = {};
    Object.keys(Cookies.get()).forEach(name => {
      const value = Cookies.get(name);
      if (value) cookies[name] = value;
    });
    return cookies;
  },

  // Save cookies to database
  async saveCookies(userId: string): Promise<void> {
    try {
      const cookies = this.getAllCookies();
      
      const { error } = await supabase
        .from('user_cookies')
        .insert({
          user_id: userId,
          cookies: cookies
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save cookies:', error);
      throw error;
    }
  },

  // Get stored cookies for user
  async getStoredCookies(userId: string): Promise<StoredCookies | null> {
    try {
      const { data, error } = await supabase
        .from('user_cookies')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results

      if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" error
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get stored cookies:', error);
      return null;
    }
  },

  // Restore cookies to browser
  restoreCookies(cookies: Record<string, string>): void {
    try {
      Object.entries(cookies).forEach(([name, value]) => {
        Cookies.set(name, value, { expires: 7 }); // Set cookies with 7 days expiry
      });
    } catch (error) {
      console.error('Failed to restore cookies:', error);
    }
  },

  // Clear all cookies from browser
  clearAllCookies(): void {
    try {
      Object.keys(Cookies.get()).forEach(name => {
        Cookies.remove(name);
      });
    } catch (error) {
      console.error('Failed to clear cookies:', error);
    }
  }
};