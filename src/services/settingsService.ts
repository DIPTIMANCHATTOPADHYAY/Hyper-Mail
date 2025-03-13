import { SiteSettings, ThemeColors, ApiSettings, SmtpSettings, EmailTemplate } from '../types';

const STORAGE_KEY = 'site_settings';

const defaultColors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    bgPrimary: '#f8f9ff',
    bgSecondary: '#ffffff',
    textPrimary: '#1a1b1e',
    textSecondary: '#4a5568',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    border: '#e2e8f0',
    buttonBg: '#f1f5f9',
    buttonHover: '#e2e8f0',
    danger: '#ef4444',
    dangerHover: '#dc2626',
    shadowColor: 'rgba(99, 102, 241, 0.1)'
  },
  dark: {
    bgPrimary: '#111827',
    bgSecondary: '#1f2937',
    textPrimary: '#f3f4f6',
    textSecondary: '#d1d5db',
    accent: '#818cf8',
    accentHover: '#6366f1',
    border: '#374151',
    buttonBg: '#374151',
    buttonHover: '#4b5563',
    danger: '#ef4444',
    dangerHover: '#f87171',
    shadowColor: 'rgba(0, 0, 0, 0.3)'
  }
};

const defaultApiSettings: ApiSettings = {
  enabled: false,
  rateLimit: {
    enabled: true,
    requestsPerMinute: 60,
    burstLimit: 10
  },
  cors: {
    enabled: true,
    allowedOrigins: ['*'],
    allowedMethods: ['GET', 'POST', 'DELETE']
  },
  security: {
    requireApiKey: true,
    apiKeys: []
  },
  endpoints: {
    createEmail: true,
    getEmails: true,
    getEmailContent: true,
    deleteEmail: true
  }
};

const defaultSmtpSettings: SmtpSettings = {
  enabled: false,
  host: '',
  port: 587,
  secure: false,
  auth: {
    user: '',
    pass: ''
  },
  from: {
    name: 'Hyper Mail',
    email: 'noreply@hypercrx.live'
  },
  encryption: 'starttls',
  pooling: {
    enabled: true,
    maxConnections: 5,
    maxMessages: 100
  },
  templates: [
    {
      id: crypto.randomUUID(),
      name: 'Welcome Email',
      subject: 'Welcome to Hyper Mail',
      body: `Dear {{name}},

Welcome to Hyper Mail! We're excited to have you on board.

Your temporary email address is: {{email}}

Best regards,
The Hyper Mail Team`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

const defaultSettings: SiteSettings = {
  siteName: 'Hyper Mail',
  siteUrl: 'https://hypercrx.live',
  siteDescription: 'Secure, temporary email service for your privacy needs.',
  adsEnabled: false,
  showLoginButton: true,
  adSlots: {
    topBanner: '1234567890',
    sidebar1: '9876543210',
    sidebar2: '5678901234',
    bottomBanner: '3456789012'
  },
  colors: defaultColors,
  api: defaultApiSettings,
  smtp: defaultSmtpSettings
};

export const settingsService = {
  getSettings(): SiteSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return defaultSettings;
      
      const settings = JSON.parse(stored);
      // Ensure all properties exist with defaults
      settings.showLoginButton = settings.showLoginButton ?? defaultSettings.showLoginButton;
      settings.colors = settings.colors || defaultColors;
      settings.colors.light = { ...defaultColors.light, ...settings.colors.light };
      settings.colors.dark = { ...defaultColors.dark, ...settings.colors.dark };
      settings.api = { ...defaultApiSettings, ...settings.api };
      settings.smtp = { ...defaultSmtpSettings, ...settings.smtp };
      
      return settings;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return defaultSettings;
    }
  },

  saveSettings(settings: SiteSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      this.applyThemeColors(settings.colors);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  resetSettings(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      this.applyThemeColors(defaultColors);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  },

  applyThemeColors(colors: { light: ThemeColors; dark: ThemeColors }): void {
    const root = document.documentElement;
    const theme = root.classList.contains('dark') ? 'dark' : 'light';
    const currentColors = colors[theme];

    Object.entries(currentColors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssVar}`, value);
    });
  },

  getDefaultColors(): { light: ThemeColors; dark: ThemeColors } {
    return defaultColors;
  },

  generateApiKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const prefix = 'hm_';
    let key = prefix;
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  },

  createEmailTemplate(): EmailTemplate {
    return {
      id: crypto.randomUUID(),
      name: 'New Template',
      subject: '',
      body: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
};