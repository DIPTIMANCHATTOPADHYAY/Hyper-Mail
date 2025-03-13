export interface User {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  status: string;
  last_login: string | null;
  created_at: string;
  is_admin: boolean;
}

export interface AdminConfig {
  adminEmails: string[];
}