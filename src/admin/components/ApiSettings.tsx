import React, { useState } from 'react';
import { Key, Plus, Trash2, Copy, AlertCircle } from 'lucide-react';
import { ApiKey, ApiSettings as ApiSettingsType } from '../../types';
import { settingsService } from '../../services/settingsService';
import { toast } from 'react-hot-toast';

interface ApiSettingsProps {
  settings: ApiSettingsType;
  onUpdate: (settings: ApiSettingsType) => void;
}

export function ApiSettings({ settings, onUpdate }: ApiSettingsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [showAddKey, setShowAddKey] = useState(false);

  const handleToggle = (path: string) => {
    const updateSettings = (obj: any, path: string[], value: any): any => {
      const [current, ...rest] = path;
      if (rest.length === 0) {
        return { ...obj, [current]: value };
      }
      return { ...obj, [current]: updateSettings(obj[current], rest, value) };
    };

    const pathArray = path.split('.');
    const currentValue = pathArray.reduce((obj, key) => obj[key], settings);
    const newSettings = updateSettings(settings, pathArray, !currentValue);
    onUpdate(newSettings);
  };

  const handleNumberChange = (path: string, value: number) => {
    const updateSettings = (obj: any, path: string[], value: any): any => {
      const [current, ...rest] = path;
      if (rest.length === 0) {
        return { ...obj, [current]: value };
      }
      return { ...obj, [current]: updateSettings(obj[current], rest, value) };
    };

    const pathArray = path.split('.');
    const newSettings = updateSettings(settings, pathArray, value);
    onUpdate(newSettings);
  };

  const handleAddApiKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    const newKey: ApiKey = {
      id: crypto.randomUUID(),
      name: newKeyName.trim(),
      key: settingsService.generateApiKey(),
      createdAt: new Date().toISOString()
    };

    const newSettings = {
      ...settings,
      security: {
        ...settings.security,
        apiKeys: [...settings.security.apiKeys, newKey]
      }
    };

    onUpdate(newSettings);
    setNewKeyName('');
    setShowAddKey(false);
    toast.success('API key created successfully');
  };

  const handleDeleteApiKey = (keyId: string) => {
    const newSettings = {
      ...settings,
      security: {
        ...settings.security,
        apiKeys: settings.security.apiKeys.filter(key => key.id !== keyId)
      }
    };

    onUpdate(newSettings);
    setShowDeleteConfirm(null);
    toast.success('API key deleted successfully');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* API Status */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Access</h3>
          <p className="text-sm text-[var(--text-secondary)]">Enable or disable API access</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={() => handleToggle('enabled')}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
        </label>
      </div>

      {settings.enabled && (
        <>
          {/* Rate Limiting */}
          <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium">Rate Limiting</h4>
                <p className="text-sm text-[var(--text-secondary)]">Control API request limits</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.rateLimit.enabled}
                  onChange={() => handleToggle('rateLimit.enabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
              </label>
            </div>

            {settings.rateLimit.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Requests per Minute</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.rateLimit.requestsPerMinute}
                    onChange={(e) => handleNumberChange('rateLimit.requestsPerMinute', parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Burst Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.rateLimit.burstLimit}
                    onChange={(e) => handleNumberChange('rateLimit.burstLimit', parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* CORS Settings */}
          <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium">CORS Settings</h4>
                <p className="text-sm text-[var(--text-secondary)]">Configure Cross-Origin Resource Sharing</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cors.enabled}
                  onChange={() => handleToggle('cors.enabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
              </label>
            </div>

            {settings.cors.enabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Allowed Origins</label>
                  <input
                    type="text"
                    value={settings.cors.allowedOrigins.join(', ')}
                    onChange={(e) => {
                      const origins = e.target.value.split(',').map(o => o.trim()).filter(Boolean);
                      onUpdate({
                        ...settings,
                        cors: { ...settings.cors, allowedOrigins: origins }
                      });
                    }}
                    placeholder="*, https://example.com"
                    className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                  />
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Separate multiple origins with commas. Use * to allow all origins.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Allowed Methods</label>
                  <div className="flex flex-wrap gap-2">
                    {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].map(method => (
                      <label key={method} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.cors.allowedMethods.includes(method)}
                          onChange={(e) => {
                            const methods = e.target.checked
                              ? [...settings.cors.allowedMethods, method]
                              : settings.cors.allowedMethods.filter(m => m !== method);
                            onUpdate({
                              ...settings,
                              cors: { ...settings.cors, allowedMethods: methods }
                            });
                          }}
                          className="w-4 h-4 rounded border-[var(--border)]"
                        />
                        <span className="ml-2 text-sm">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* API Keys */}
          <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium">API Keys</h4>
                <p className="text-sm text-[var(--text-secondary)]">Manage API access keys</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.requireApiKey}
                  onChange={() => handleToggle('security.requireApiKey')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
              </label>
            </div>

            {settings.security.requireApiKey && (
              <div className="space-y-4">
                {settings.security.apiKeys.map(key => (
                  <div key={key.id} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg">
                    <div>
                      <p className="font-medium">{key.name}</p>
                      <p className="text-sm font-mono text-[var(--text-secondary)]">{key.key}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Created: {new Date(key.createdAt).toLocaleDateString()}
                        {key.lastUsed && ` • Last used: ${new Date(key.lastUsed).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(key.key)}
                        className="p-2 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                        title="Copy API key"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(key.id)}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                        title="Delete API key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {showAddKey ? (
                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                          placeholder="Enter key name"
                          className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]"
                        />
                      </div>
                      <button
                        onClick={handleAddApiKey}
                        className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => {
                          setShowAddKey(false);
                          setNewKeyName('');
                        }}
                        className="px-4 py-2 bg-[var(--bg-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddKey(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-secondary)]/80 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add API Key</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Endpoint Settings */}
          <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg">
            <h4 className="font-medium mb-4">Endpoint Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Create Email</p>
                  <p className="text-sm text-[var(--text-secondary)]">Allow creation of temporary emails</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.endpoints.createEmail}
                    onChange={() => handleToggle('endpoints.createEmail')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Get Emails</p>
                  <p className="text-sm text-[var(--text-secondary)]">Allow fetching email list</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.endpoints.getEmails}
                    onChange={() => handleToggle('endpoints.getEmails')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Get Email Content</p>
                  <p className="text-sm text-[var(--text-secondary)]">Allow fetching email content</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.endpoints.getEmailContent}
                    onChange={() => handleToggle('endpoints.getEmailContent')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Email</p>
                  <p className="text-sm text-[var(--text-secondary)]">Allow email deletion</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.endpoints.deleteEmail}
                    onChange={() => handleToggle('endpoints.deleteEmail')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                </label>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete API Key Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-primary)] rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold">Delete API Key?</h3>
            </div>
            <p className="text-[var(--text-secondary)] mb-6">
              Are you sure you want to delete this API key? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-[var(--bg-secondary)] rounded-md hover:bg-[var(--bg-secondary)]/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => showDeleteConfirm && handleDeleteApiKey(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}