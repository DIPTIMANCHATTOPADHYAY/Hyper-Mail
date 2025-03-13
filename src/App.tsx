import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Copy, RefreshCcw, RotateCcw, Moon, Sun, AlertCircle, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createAccount, getMessages, getMessage } from './api';
import { Account, Email } from './types';
import { useTheme } from './ThemeContext';
import Menu from './components/Menu';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { UserSettings } from './pages/UserSettings';
import { AdminDashboard } from './admin/pages/AdminDashboard';
import { AdminLogin } from './admin/pages/AdminLogin';
import { Footer } from './components/Footer';
import { CookieConsent } from './components/CookieConsent';
import { cookieService } from './services/cookieService';
import { AdBanner } from './components/ads/AdBanner';
import { settingsService } from './services/settingsService';
import { authService } from './services/authService';
import { AuthModal } from './components/auth/AuthModal';
import { UserMenu } from './components/auth/UserMenu';
import { adminService } from './admin/services/adminService';
import { supabase } from './services/supabaseClient';
import { Toast } from './components/Toast';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [account, setAccount] = useState<Account | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [emailCount, setEmailCount] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const initRef = useRef(false);
  const toastTimeoutRef = useRef<{ [key: string]: number }>({});
  const settings = settingsService.getSettings();

  const getInitialPage = () => {
    const hashPage = window.location.hash.slice(1);
    return hashPage || 'home';
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);

  useEffect(() => {
    // Listen for session expiration
    const handleSessionExpired = () => {
      toast.error('Session expired. Please generate a new email address.');
      setAccount(null);
      setEmails([]);
      setSelectedEmail(null);
    };

    // Listen for session cleared
    const handleSessionCleared = () => {
      setAccount(null);
      setEmails([]);
      setSelectedEmail(null);
    };

    window.addEventListener('sessionExpired', handleSessionExpired);
    window.addEventListener('sessionCleared', handleSessionCleared);

    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
      window.removeEventListener('sessionCleared', handleSessionCleared);
    };
  }, []);

  useEffect(() => {
    const handleHashChange = async () => {
      const page = window.location.hash.slice(1) || 'home';
      
      if (page === 'admin') {
        const isAdmin = await adminService.redirectIfNotAdmin();
        if (!isAdmin) {
          setShowAuthModal(true);
          return;
        }
      }
      
      setCurrentPage(page);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check initial hash
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      
      if (currentPage === 'admin') {
        const isAdmin = await adminService.redirectIfNotAdmin();
        if (!isAdmin) {
          toast.error('Access denied. Admin privileges required.');
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [currentPage]);

  const handlePageNavigation = async (page: string) => {
    if (page === 'admin') {
      const isAdmin = await adminService.redirectIfNotAdmin();
      if (!isAdmin) {
        setShowAuthModal(true);
        return;
      }
    }
    
    setCurrentPage(page);
    window.location.hash = page;
  };

  const showToast = useCallback((key: string, message: string, options: any = {}) => {
    if (toastTimeoutRef.current[key]) {
      clearTimeout(toastTimeoutRef.current[key]);
    }

    toastTimeoutRef.current[key] = window.setTimeout(() => {
      toast(message, options);
      delete toastTimeoutRef.current[key];
    }, 100) as unknown as number;
  }, []);

  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      const newAccount = await createAccount();
      setAccount(newAccount);
      setEmails([]);
      setSelectedEmail(null);
      setEmailCount(0);
      cookieService.setEmailSession(newAccount);
      showToast('account', 'New email address generated!', {
        duration: 3000,
        icon: '🎯'
      });
    } catch (error: any) {
      showToast('error', error.message || 'Failed to create account', {
        icon: '❌',
        duration: 4000
      });
      setAccount(null);
      cookieService.clearEmailSession();
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleCopyEmail = () => {
    if (account?.email_addr) {
      navigator.clipboard.writeText(account.email_addr);
      showToast('copy', 'Email address copied to clipboard!', {
        icon: '✅',
        duration: 2000
      });
    }
  };

  const handleRefresh = useCallback(async () => {
    if (!account?.sid_token) return;
    setLoading(true);
    try {
      const messages = await getMessages(account.sid_token);
      if (messages.length > emailCount) {
        const newEmailCount = messages.length - emailCount;
        showToast('newEmail', `${newEmailCount} new email${newEmailCount > 1 ? 's' : ''} received!`, {
          duration: 3000,
          icon: '💌'
        });
      }
      setEmails(messages);
      setEmailCount(messages.length);
      setRefreshCountdown(30);
    } catch (error: any) {
      showToast('error', error.message || 'Failed to fetch emails', {
        icon: '⚠️',
        duration: 4000
      });
      setAutoRefresh(false);
    } finally {
      setLoading(false);
    }
  }, [account, emailCount, showToast]);

  const handleSelectEmail = async (email: Email) => {
    if (!account?.sid_token) return;
    try {
      const fullEmail = await getMessage(account.sid_token, email.mail_id);
      setSelectedEmail(fullEmail);
    } catch (error: any) {
      showToast('error', error.message || 'Failed to fetch email details', {
        icon: '⚠️',
        duration: 3000
      });
    }
  };

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeSession = async () => {
      const savedSession = cookieService.getEmailSession();
      if (savedSession) {
        setAccount(savedSession);
        try {
          const messages = await getMessages(savedSession.sid_token);
          setEmails(messages);
          setEmailCount(messages.length);
        } catch (error) {
          console.error('Failed to fetch initial emails:', error);
          handleCreateAccount();
        }
      } else {
        handleCreateAccount();
      }
    };

    initializeSession();
  }, []);

  useEffect(() => {
    if (!account?.sid_token || !autoRefresh) return;

    const checkInterval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          handleRefresh();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    const refreshInterval = setInterval(handleRefresh, 30000);

    return () => {
      clearInterval(checkInterval);
      clearInterval(refreshInterval);
    };
  }, [account, autoRefresh, handleRefresh]);

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
    showToast('autoRefresh', autoRefresh ? 'Auto-refresh disabled' : 'Auto-refresh enabled', {
      icon: autoRefresh ? '⏸️' : '▶️',
      duration: 2000
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'terms':
        return <Terms />;
      case 'privacy':
        return <Privacy />;
      case 'admin':
        return user ? <AdminDashboard /> : <AdminLogin />;
      case 'settings':
        return user ? <UserSettings /> : null;
      default:
        return <Home emails={emails} selectedEmail={selectedEmail} onSelectEmail={handleSelectEmail} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Toast />
      
      {settings.adsEnabled && (
        <AdBanner slot={settings.adSlots.topBanner} format="horizontal" className="w-full max-w-4xl mx-auto mt-4" />
      )}
      
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-row justify-between items-center mb-6 sm:mb-8">
          <button
            onClick={() => handlePageNavigation('home')}
            className="text-2xl sm:text-3xl font-bold text-[var(--accent)] hover:opacity-80 transition-opacity"
          >
            {settings.siteName}
          </button>
          <div className="flex items-center gap-3">
            {user ? (
              <UserMenu 
                email={user.email || ''} 
                onShowSettings={() => handlePageNavigation('settings')}
              />
            ) : settings.showLoginButton ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:block">Login</span>
              </button>
            ) : null}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/80 transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent)]" />
              ) : (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent)]" />
              )}
            </button>
            <Menu 
              currentPage={currentPage} 
              onNavigate={handlePageNavigation}
              autoRefresh={autoRefresh}
              onToggleAutoRefresh={toggleAutoRefresh}
              userEmail={user?.email || null}
              onShowAuthModal={() => setShowAuthModal(true)}
            />
          </div>
        </header>

        {currentPage === 'home' && (
          <>
            <div className="max-w-2xl mx-auto mb-6">
              <p className="text-center text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {settings.siteDescription}
              </p>
            </div>

            <div className="bg-[var(--bg-secondary)]/50 p-4 sm:p-6 rounded-lg shadow-lg mb-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-[var(--bg-secondary)] p-4 rounded-lg">
                <div className="w-full sm:flex-1 font-mono text-base sm:text-lg break-all text-center sm:text-left">
                  {loading ? (
                    <div className="animate-pulse bg-[var(--bg-primary)] h-6 rounded w-3/4 mx-auto sm:mx-0"></div>
                  ) : (
                    <span className="text-[var(--accent)]">{account?.email_addr || 'Generating...'}</span>
                  )}
                </div>
                <button
                  onClick={handleCopyEmail}
                  disabled={!account?.email_addr}
                  className="btn btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-md"
                >
                  <Copy className="w-5 h-5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                onClick={handleRefresh}
                className="btn btn-secondary flex items-center justify-center gap-2 p-3.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <RefreshCcw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh ({refreshCountdown}s)
              </button>
              <button
                onClick={() => setShowConfirmation(true)}
                className="btn btn-secondary flex items-center justify-center gap-2 p-3.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                Change Address
              </button>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-6">
            {renderPage()}
          </div>
        </div>

        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--bg-primary)] rounded-lg p-6 max-w-md w-full shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-[var(--accent)]" />
                <h3 className="text-lg font-semibold">Generate New Email?</h3>
              </div>
              <p className="text-[var(--text-secondary)] mb-6">
                Are you sure you want to generate a new email address? This will delete your current inbox and all messages.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="btn btn-secondary px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAccount}
                  className="btn btn-primary px-4 py-2 rounded-md"
                >
                  Generate New Email
                </button>
              </div>
            </div>
          </div>
        )}

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
      
      {settings.adsEnabled && (
        <AdBanner slot={settings.adSlots.bottomBanner} format="horizontal" className="w-full max-w-4xl mx-auto mt-8 mb-4" />
      )}
      
      <Footer />
      <CookieConsent />
    </div>
  );
}