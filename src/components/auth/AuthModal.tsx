import React, { useState } from 'react';
import { X, Mail, Lock, AlertCircle, Eye, EyeOff, Info, Shield, User } from 'lucide-react';
import { authService } from '../../services/authService';
import { toast } from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'reset';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [asAdmin, setAsAdmin] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      switch (mode) {
        case 'login':
          await authService.signIn(email, password);
          toast.success('Successfully logged in!');
          onClose();
          break;

        case 'register':
          if (!firstName.trim() || !lastName.trim()) {
            throw new Error('First name and last name are required');
          }
          await authService.signUp(email, password, firstName, lastName, asAdmin);
          toast.success('Account created successfully! Please check your email to verify your account.');
          onClose();
          break;

        case 'reset':
          await authService.resetPassword(email);
          toast.success('Password reset email sent!');
          setMode('login');
          break;
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setError('');
    setAsAdmin(false);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--bg-primary)] rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--accent)]">
            {mode === 'login' ? 'Login' : mode === 'register' ? 'Create Account' : 'Reset Password'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">Error</p>
            </div>
            {error.split('\n').map((line, index) => (
              <p key={index} className="text-sm ml-7">{line}</p>
            ))}
          </div>
        )}

        {mode === 'register' && (
          <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">Password Requirements</p>
            </div>
            <ul className="text-sm ml-7 list-disc">
              <li>At least 8 characters long</li>
              <li>Must contain at least one number</li>
              <li>Must contain at least one special character</li>
              <li>Must contain at least one uppercase letter</li>
              <li>Must contain at least one lowercase letter</li>
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                    placeholder="Enter first name"
                    required
                  />
                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                    placeholder="Enter last name"
                    required
                  />
                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                </div>
              </div>
            </div>
          )}

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

          {mode !== 'reset' && (
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
          )}

          {mode === 'register' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={asAdmin}
                onChange={(e) => setAsAdmin(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)]"
              />
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm">Register as Admin</span>
              </div>
            </label>
          )}

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
            ) : mode === 'login' ? (
              'Login'
            ) : mode === 'register' ? (
              'Create Account'
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          {mode === 'login' ? (
            <>
              <button
                onClick={() => switchMode('reset')}
                className="text-[var(--accent)] hover:underline"
              >
                Forgot password?
              </button>
              <p className="mt-2">
                Don't have an account?{' '}
                <button
                  onClick={() => switchMode('register')}
                  className="text-[var(--accent)] hover:underline"
                >
                  Create one
                </button>
              </p>
            </>
          ) : mode === 'register' ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => switchMode('login')}
                className="text-[var(--accent)] hover:underline"
              >
                Login
              </button>
            </p>
          ) : (
            <button
              onClick={() => switchMode('login')}
              className="text-[var(--accent)] hover:underline"
            >
              Back to login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}