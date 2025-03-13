import React, { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';
import { adminService } from '../services/adminService';
import { toast } from 'react-hot-toast';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.signIn(email, password);
      const isAdmin = await adminService.isAdmin(email);
      
      if (!isAdmin) {
        await authService.signOut();
        toast.error('Access denied. Admin privileges required.');
        return;
      }

      toast.success('Successfully logged in as admin');
      window.location.href = '/admin';
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-[var(--accent)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--accent)]">Admin Login</h2>
          <p className="text-[var(--text-secondary)] mt-2">
            Please sign in with your admin credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                placeholder="Enter your email"
                required
              />
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                placeholder="Enter your password"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-2 rounded-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a 
            href="/"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
}