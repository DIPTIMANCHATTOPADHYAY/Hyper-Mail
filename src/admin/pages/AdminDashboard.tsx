import React, { useState, useEffect } from 'react';
import { Users, Search, Edit2, Trash2, AlertCircle, Shield, Settings, Save, RotateCcw, Sun, Moon, Key, Mail, Palette, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/services/supabaseClient';
import { AdminHeader } from '../components/AdminHeader';
import { format } from 'date-fns';
import { SiteSettings, ThemeColors, User } from '@/types';
import { settingsService } from '@/services/settingsService';
import { SmtpSettings } from '../components/SmtpSettings';
import { ApiSettings } from '../components/ApiSettings';
import { ColorSettings } from '../components/ColorSettings';

export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(settingsService.getSettings());
  const [isModified, setIsModified] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'api' | 'smtp' | 'colors'>('users');
  const [error, setError] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setError(null);
      const { data, error } = await supabase.rpc('get_all_users');
      
      if (error) throw error;

      if (!data) {
        throw new Error('No data returned from server');
      }

      const typedUsers: User[] = data.map(user => ({
        id: user.id,
        email: user.email || '',
        display_name: user.display_name || 'Unnamed User',
        role: user.role || 'user',
        status: user.status || 'active',
        last_login: user.last_login,
        created_at: user.created_at || new Date().toISOString(),
        is_admin: user.is_admin || false
      }));

      setUsers(typedUsers);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch users';
      console.error('Error fetching users:', error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setError(null);
      const { error } = await supabase.rpc('delete_user', { user_id: userId });
      
      if (error) throw error;
      
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete user';
      console.error('Error deleting user:', error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setError(null);
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: editingUser.id,
          display_name: editingUser.display_name,
          role: editingUser.role,
          status: editingUser.status,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === editingUser.id ? editingUser : user
      ));
      
      toast.success('User updated successfully');
      setEditingUser(null);
      
      // Refresh the user list to ensure we have the latest data
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update user';
      console.error('Error updating user:', error);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section?: keyof SiteSettings['adSlots']
  ) => {
    const { name, value, type } = e.target;
    
    setSettings(prev => {
      if (section) {
        return {
          ...prev,
          adSlots: {
            ...prev.adSlots,
            [section]: value
          }
        };
      }
      
      return {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      };
    });
    
    setIsModified(true);
  };

  const handleSaveSettings = () => {
    try {
      settingsService.saveSettings(settings);
      toast.success('Settings saved successfully!');
      setIsModified(false);
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleResetSettings = () => {
    const defaultSettings = settingsService.getSettings();
    setSettings(defaultSettings);
    settingsService.resetSettings();
    setIsModified(false);
    setShowResetConfirm(false);
    toast.success('Settings reset to default');
  };

  const handleSmtpSettingsChange = (smtpSettings: typeof settings.smtp) => {
    setSettings(prev => ({
      ...prev,
      smtp: smtpSettings
    }));
    setIsModified(true);
  };

  const handleApiSettingsChange = (apiSettings: typeof settings.api) => {
    setSettings(prev => ({
      ...prev,
      api: apiSettings
    }));
    setIsModified(true);
  };

  const handleColorSettingsChange = (colors: { light: ThemeColors; dark: ThemeColors }) => {
    setSettings(prev => ({
      ...prev,
      colors
    }));
    setIsModified(true);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'colors', label: 'Colors', icon: <Palette className="w-4 h-4" /> },
    { id: 'api', label: 'API', icon: <Key className="w-4 h-4" /> },
    { id: 'smtp', label: 'SMTP', icon: <Mail className="w-4 h-4" /> }
  ] as const;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-[var(--bg-primary)] border-b border-[var(--border)] p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/80"
          >
            <ChevronDown className={`w-5 h-5 transition-transform ${showMobileMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {showMobileMenu && (
          <div className="absolute top-full left-0 right-0 bg-[var(--bg-primary)] border-b border-[var(--border)] shadow-lg">
            <div className="p-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[var(--accent)] text-white'
                      : 'hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex flex-col w-64 min-h-screen bg-[var(--bg-secondary)] border-r border-[var(--border)]">
          <div className="p-6 border-b border-[var(--border)]">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>
          <nav className="flex-1 p-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[var(--accent)] text-white'
                    : 'hover:bg-[var(--bg-secondary)]/80'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          {activeTab === 'users' ? (
            <>
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                    />
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  </div>
                </div>

                {error && (
                  <div className="mt-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      <p className="font-medium">{error}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[var(--bg-secondary)] rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="px-6 py-4 text-left text-sm font-medium">User</th>
                        <th className="px-6 py-4 text-left text-sm font-medium">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-medium hidden sm:table-cell">Last Login</th>
                        <th className="px-6 py-4 text-left text-sm font-medium hidden sm:table-cell">Created</th>
                        <th className="px-6 py-4 text-right text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                              <span>Loading users...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-[var(--bg-secondary)]/50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {user.is_admin && (
                                  <Shield className="w-4 h-4 text-[var(--accent)]" />
                                )}
                                <div>
                                  <div className="font-medium">{user.display_name || 'Unnamed User'}</div>
                                  <div className="text-sm text-[var(--text-secondary)]">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">{user.role}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.status === 'active' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm hidden sm:table-cell">
                              {user.last_login 
                                ? format(new Date(user.last_login), 'MMM d, yyyy HH:mm')
                                : 'Never'
                              }
                            </td>
                            <td className="px-6 py-4 text-sm hidden sm:table-cell">
                              {format(new Date(user.created_at), 'MMM d, yyyy')}
                            </td>
                            <td className="px-6 py-4 text-right space-x-1">
                              <button
                                onClick={() => setEditingUser(user)}
                                className="text-[var(--text-secondary)] hover:text-[var(--accent)] p-2 rounded-lg hover:bg-[var(--bg-secondary)]/80"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(user.id)}
                                className="text-[var(--text-secondary)] hover:text-red-500 p-2 rounded-lg hover:bg-[var(--bg-secondary)]/80"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : activeTab === 'settings' ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Site Settings</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="btn btn-secondary px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={!isModified}
                    className="btn btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="grid gap-8">
                {/* Site Information */}
                <div className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-6">Site Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Site Name</label>
                      <input
                        type="text"
                        name="siteName"
                        value={settings.siteName}
                        onChange={handleSettingsChange}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Site URL</label>
                      <input
                        type="url"
                        name="siteUrl"
                        value={settings.siteUrl}
                        onChange={handleSettingsChange}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Site Description</label>
                      <textarea
                        name="siteDescription"
                        value={settings.siteDescription}
                        onChange={handleSettingsChange}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="showLoginButton"
                          checked={settings.showLoginButton}
                          onChange={handleSettingsChange}
                          className="w-4 h-4 rounded border-[var(--border)]"
                        />
                        <span className="text-sm font-medium">Show Login Button</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Advertisement Settings */}
                <div className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Advertisement Settings</h3>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="adsEnabled"
                        checked={settings.adsEnabled}
                        onChange={handleSettingsChange}
                        className="w-5 h-5 rounded border-[var(--border)]"
                      />
                      <span className="text-sm font-medium">Enable Ads</span>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Top Banner Ad Slot</label>
                      <input
                        type="text"
                        value={settings.adSlots.topBanner}
                        onChange={(e) => handleSettingsChange(e, 'topBanner')}
                        disabled={!settings.adsEnabled}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Sidebar Ad Slot 1</label>
                      <input
                        type="text"
                        value={settings.adSlots.sidebar1}
                        onChange={(e) => handleSettingsChange(e, 'sidebar1')}
                        disabled={!settings.adsEnabled}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Sidebar Ad Slot 2</label>
                      <input
                        type="text"
                        value={settings.adSlots.sidebar2}
                        onChange={(e) => handleSettingsChange(e, 'sidebar2')}
                        disabled={!settings.adsEnabled}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Bottom Banner Ad Slot</label>
                      <input
                        type="text"
                        value={settings.adSlots.bottomBanner}
                        onChange={(e) => handleSettingsChange(e, 'bottomBanner')}
                        disabled={!settings.adsEnabled}
                        className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === 'colors' ? (
            <>
              <h2 className="text-2xl font-bold mb-6">Color Settings</h2>
              <ColorSettings colors={settings.colors} onUpdate={handleColorSettingsChange} />
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSaveSettings}
                  disabled={!isModified}
                  className="btn btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </>
          ) : activeTab === 'api' ? (
            <>
              <h2 className="text-2xl font-bold mb-6">API Settings</h2>
              <ApiSettings settings={settings.api} onUpdate={handleApiSettingsChange} />
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSaveSettings}
                  disabled={!isModified}
                  className="btn btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-6">SMTP Settings</h2>
              <SmtpSettings settings={settings.smtp} onUpdate={handleSmtpSettingsChange} />
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSaveSettings}
                  disabled={!isModified}
                  className="btn btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-primary)] rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <input
                  type="text"
                  value={editingUser.display_name || ''}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    display_name: e.target.value
                  })}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    role: e.target.value
                  })}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    status: e.target.value
                  })}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn btn-secondary px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 py-2 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-primary)] rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold">Delete User?</h3>
            </div>
            <p className="text-[var(--text-secondary)] mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn btn-secondary px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => showDeleteConfirm && handleDeleteUser(showDeleteConfirm)}
                className="btn px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Settings Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-primary)] rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-[var(--accent)]" />
              <h3 className="text-lg font-semibold">Reset Settings?</h3>
            </div>
            <p className="text-[var(--text-secondary)] mb-6">
              Are you sure you want to reset all settings to their default values? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn btn-secondary px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleResetSettings}
                className="btn btn-primary px-4 py-2 rounded-lg"
              >
                Reset Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}