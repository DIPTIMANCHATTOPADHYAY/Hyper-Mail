import { supabase } from '../../services/supabaseClient';

export const adminService = {
  async isAdmin(email: string | null): Promise<boolean> {
    if (!email) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  async redirectIfNotAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.hash = '';
        return false;
      }

      const isAdmin = await this.isAdmin(user.email);
      if (!isAdmin) {
        window.location.hash = '';
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      window.location.hash = '';
      return false;
    }
  }
};