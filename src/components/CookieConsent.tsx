import React, { useEffect, useState } from 'react';
import { Cookie, X, Shield, Bell } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('cookie-preferences');
    if (!cookieChoice) {
      setShowConsent(true);
    } else {
      setPreferences(JSON.parse(cookieChoice));
    }
  }, []);

  const handleAcceptAll = () => {
    const newPreferences = {
      necessary: true,
      analytics: true,
      marketing: true
    };
    savePreferences(newPreferences);
  };

  const handleAcceptSelected = () => {
    savePreferences(preferences);
  };

  const handleDeny = () => {
    const newPreferences = {
      necessary: true,
      analytics: false,
      marketing: false
    };
    savePreferences(newPreferences);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-preferences', JSON.stringify(prefs));
    setPreferences(prefs);
    setShowConsent(false);
    setShowPreferences(false);
  };

  if (!showConsent && !showPreferences) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--bg-primary)] rounded-lg shadow-xl max-w-2xl w-full">
        {showPreferences ? (
          // Detailed Cookie Preferences
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Cookie className="w-6 h-6 text-[var(--accent)]" />
                <h2 className="text-xl font-semibold">Cookie Preferences</h2>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Necessary Cookies */}
              <div className="bg-[var(--bg-secondary)] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[var(--accent)]" />
                    <h3 className="font-medium">Necessary Cookies</h3>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.necessary}
                    disabled
                    className="w-4 h-4 accent-[var(--accent)]"
                  />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  These cookies are essential for the website to function properly.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-[var(--bg-secondary)] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[var(--accent)]" />
                    <h3 className="font-medium">Analytics Cookies</h3>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      analytics: e.target.checked
                    }))}
                    className="w-4 h-4 accent-[var(--accent)]"
                  />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Help us understand how visitors interact with our website.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-[var(--bg-secondary)] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[var(--accent)]" />
                    <h3 className="font-medium">Marketing Cookies</h3>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      marketing: e.target.checked
                    }))}
                    className="w-4 h-4 accent-[var(--accent)]"
                  />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Used to deliver personalized advertisements and track their performance.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleDeny}
                className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptSelected}
                className="px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        ) : (
          // Initial Consent Dialog
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-8 h-8 text-[var(--accent)]" />
              <h2 className="text-xl font-semibold">Cookie Settings</h2>
            </div>
            
            <p className="text-[var(--text-secondary)] mb-6">
              We use cookies to enhance your experience. Some cookies are essential for the website to function properly, 
              while others help us improve our services and your experience. You can customize your preferences or 
              accept all cookies.
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleDeny}
                className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors order-3 sm:order-1"
              >
                Reject All
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 text-sm font-medium border border-[var(--border)] rounded-md hover:bg-[var(--bg-secondary)] transition-colors order-2"
              >
                Customize
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors order-1 sm:order-3"
              >
                Accept All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}