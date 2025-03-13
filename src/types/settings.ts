export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  border: string;
  buttonBg: string;
  buttonHover: string;
  danger: string;
  dangerHover: string;
  shadowColor: string;
}

export interface SmtpSettings {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
  encryption: 'none' | 'tls' | 'starttls';
  pooling: {
    enabled: boolean;
    maxConnections: number;
    maxMessages: number;
  };
  templates: EmailTemplate[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSettings {
  enabled: boolean;
  rateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
  };
  cors: {
    enabled: boolean;
    allowedOrigins: string[];
    allowedMethods: string[];
  };
  security: {
    requireApiKey: boolean;
    apiKeys: ApiKey[];
  };
  endpoints: {
    createEmail: boolean;
    getEmails: boolean;
    getEmailContent: boolean;
    deleteEmail: boolean;
  };
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  adsEnabled: boolean;
  showLoginButton: boolean;
  adSlots: {
    topBanner: string;
    sidebar1: string;
    sidebar2: string;
    bottomBanner: string;
  };
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  api: ApiSettings;
  smtp: SmtpSettings;
}