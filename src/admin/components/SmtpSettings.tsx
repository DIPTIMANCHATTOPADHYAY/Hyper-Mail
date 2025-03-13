import React, { useState } from 'react';
import { Mail, Plus, Trash2, AlertCircle, Save, Eye, EyeOff, Send } from 'lucide-react';
import { SmtpSettings as SmtpSettingsType, EmailTemplate } from '../../types';
import { settingsService } from '../../services/settingsService';
import { toast } from 'react-hot-toast';

interface SmtpSettingsProps {
  settings: SmtpSettingsType;
  onUpdate: (settings: SmtpSettingsType) => void;
}

export function SmtpSettings({ settings, onUpdate }: SmtpSettingsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

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

  const handleInputChange = (path: string, value: string) => {
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

  const handleAddTemplate = () => {
    const newTemplate = settingsService.createEmailTemplate();
    const newSettings = {
      ...settings,
      templates: [...settings.templates, newTemplate]
    };
    onUpdate(newSettings);
    setEditingTemplate(newTemplate);
  };

  const handleUpdateTemplate = (template: EmailTemplate) => {
    const newSettings = {
      ...settings,
      templates: settings.templates.map(t => 
        t.id === template.id ? { ...template, updatedAt: new Date().toISOString() } : t
      )
    };
    onUpdate(newSettings);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    const newSettings = {
      ...settings,
      templates: settings.templates.filter(t => t.id !== templateId)
    };
    onUpdate(newSettings);
    setShowDeleteConfirm(null);
  };

  const handleTestConnection = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setSending(true);
    try {
      // Simulate sending test email
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Test email sent successfully!');
      setTestEmail('');
    } catch (error) {
      toast.error('Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SMTP Status */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SMTP Server</h3>
          <p className="text-sm text-[var(--text-secondary)]">Configure email server settings</p>
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
          {/* Server Settings */}
          <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg">
            <h4 className="font-medium mb-4">Server Configuration</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Host</label>
                <input
                  type="text"
                  value={settings.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  placeholder="smtp.example.com"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Port</label>
                <input
                  type="number"
                  value={settings.port}
                  onChange={(e) => handleNumberChange('port', parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Encryption</label>
                <select
                  value={settings.encryption}
                  onChange={(e) => handleInputChange('encryption', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                >
                  <option value="none">None</option>
                  <option value="tls">TLS</option>
                  <option value="starttls">STARTTLS</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.secure}
                    onChange={() => handleToggle('secure')}
                    className="w-4 h-4 rounded border-[var(--border)]"
                  />
                  <span className="text-sm font-medium">Use Secure Connection</span>
                </label>
              </div>
            </div>
          </div>

          {/* Authentication */}
          <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg">
            <h4 className="font-medium mb-4">Authentication</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={settings.auth.user}
                  onChange={(e) => handleInputChange('auth.user', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={settings.auth.pass}
                    onChange={(e) => handleInputChange('auth.pass', e.target.value)}
                    className="w-full px-4 py-2 pr-10 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-[var(--text-secondary)]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[var(--text-secondary)]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* From Settings */}
          <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg">
            <h4 className="font-medium mb-4">From Address</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={settings.from.name}
                  onChange={(e) => handleInputChange('from.name', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={settings.from.email}
                  onChange={(e) => handleInputChange('from.email', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                />
              </div>
            </div>
          </div>

          {/* Connection Pool */}
          <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium">Connection Pool</h4>
                <p className="text-sm text-[var(--text-secondary)]">Configure connection pooling</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pooling.enabled}
                  onChange={() => handleToggle('pooling.enabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
              </label>
            </div>

            {settings.pooling.enabled && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Max Connections</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.pooling.maxConnections}
                    onChange={(e) => handleNumberChange('pooling.maxConnections', parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Messages Per Connection</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.pooling.maxMessages}
                    onChange={(e) => handleNumberChange('pooling.maxMessages', parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Test Connection */}
          <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg">
            <h4 className="font-medium mb-4">Test Connection</h4>
            <div className="flex gap-4">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter test email address"
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
              />
              <button
                onClick={handleTestConnection}
                disabled={sending || !testEmail}
                className="btn btn-primary px-6 py-2 rounded-lg flex items-center gap-2 min-w-[120px] justify-center"
              >
                {sending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Test</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Email Templates */}
          <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Email Templates</h4>
              <button
                onClick={handleAddTemplate}
                className="btn btn-secondary px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Template
              </button>
            </div>

            <div className="space-y-4">
              {settings.templates.map(template => (
                <div key={template.id} className="bg-[var(--bg-secondary)] p-4 rounded-lg">
                  {editingTemplate?.id === template.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Template Name</label>
                        <input
                          type="text"
                          value={editingTemplate.name}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            name: e.target.value
                          })}
                          className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Subject</label>
                        <input
                          type="text"
                          value={editingTemplate.subject}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            subject: e.target.value
                          })}
                          className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Body</label>
                        <textarea
                          value={editingTemplate.body}
                          onChange={(e) => setEditingTemplate({
                            ...editingTemplate,
                            body: e.target.value
                          })}
                          rows={6}
                          className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]"
                        />
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                          Available variables: {{name}}, {{email}}
                        </p>
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setEditingTemplate(null)}
                          className="px-4 py-2 rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateTemplate(editingTemplate)}
                          className="btn btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{template.name}</h5>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingTemplate(template)}
                            className="p-1 hover:bg-[var(--bg-primary)] rounded-lg transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(template.id)}
                            className="p-1 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Last updated: {new Date(template.updatedAt).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Delete Template Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-primary)] rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold">Delete Template?</h3>
            </div>
            <p className="text-[var(--text-secondary)] mb-6">
              Are you sure you want to delete this email template? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-[var(--bg-secondary)] rounded-md hover:bg-[var(--bg-secondary)]/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => showDeleteConfirm && handleDeleteTemplate(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}