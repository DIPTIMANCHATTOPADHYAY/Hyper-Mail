import React, { useState, useEffect } from 'react';
import { User, Lock, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';
import { supabase } from '../services/supabaseClient';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
}

export function UserSettings() {
  const [profile, setProfile] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile({
          first_name: user.user_metadata.first_name || '',
          last_name: user.user_metadata.last_name || '',
          email: user.email || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          full_name: `${profile.first_name} ${profile.last_name}`
        }
      });

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.updatePassword(newPassword);
      toast.success('Password updated successfully');
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);

    try {
      await authService.deleteAccount();
      toast.success('Account deleted successfully');
      window.location.href = '/';
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <User className="w-8 h-8 text-[var(--accent)]" />
        <h2 className="text-2xl font-bold">Account Settings</h2>
      </div>

      {/* Profile Section */}
      <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-6">Profile Information</h3>
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] opacity-75"
              disabled
            />
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Email address cannot be changed
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-6 py-2 rounded-lg min-w-[140px]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-6">Change Password</h3>
        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                placeholder="Enter new password"
                required
              />
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg">
            <p className="text-sm font-medium mb-2">Password Requirements:</p>
            <ul className="text-sm list-disc list-inside">
              <li>At least 8 characters long</li>
              <li>Must contain at least one number</li>
              <li>Must contain at least one special character</li>
              <li>Must contain at least one uppercase letter</li>
              <li>Must contain at least one lowercase letter</li>
            </ul>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => setNewPassword('')}
              className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-6 py-2 rounded-lg min-w-[140px]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Account Section */}
      <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg border border-red-200 dark:border-red-900/50">
        <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Delete Account</h3>
        <p className="text-[var(--text-secondary)] mb-6">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="btn px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-primary)] rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold">Delete Account?</h3>
            </div>
            <p className="text-[var(--text-secondary)] mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="btn px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}