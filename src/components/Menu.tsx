import React, { useState, useEffect } from 'react';
import { Menu as MenuIcon, X, RefreshCw, RefreshCwOff, Shield, AlertCircle } from 'lucide-react';
import { adminService } from '../admin/services/adminService';
import { toast } from 'react-hot-toast';

interface MenuProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  userEmail: string | null;
  onShowAuthModal: () => void;
}

export default function Menu({ currentPage, onNavigate, autoRefresh, onToggleAutoRefresh, userEmail, onShowAuthModal }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdminContact, setShowAdminContact] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (userEmail) {
        const adminStatus = await adminService.isAdmin(userEmail);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [userEmail]);

  const handleAdminAccess = async () => {
    if (!userEmail) {
      onShowAuthModal();
      setIsOpen(false);
      return;
    }

    if (isAdmin) {
      onNavigate('admin');
      window.location.hash = 'admin';
    } else {
      setShowAdminContact(true);
    }
    setIsOpen(false);
  };

  const handleNavigation = (page: string) => {
    if (page === 'admin') {
      handleAdminAccess();
    } else {
      onNavigate(page);
      window.location.hash = page;
      setIsOpen(false);
    }
  };

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact Us' },
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'privacy', label: 'Privacy Policy' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: <Shield className="w-4 h-4" /> }] : [])
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/80 transition-all duration-300"
        aria-label="Menu"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-[var(--accent)] transition-transform duration-300" />
        ) : (
          <MenuIcon className="w-5 h-5 text-[var(--accent)] transition-transform duration-300" />
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 rounded-lg bg-[var(--bg-primary)] shadow-lg border border-[var(--border)] overflow-hidden z-50"
          style={{
            animation: 'menu-enter 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <button
            onClick={() => {
              onToggleAutoRefresh();
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 border-b border-[var(--border)] hover:bg-[var(--bg-secondary)] ${
              autoRefresh ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'
            }`}
          >
            <div className="flex items-center gap-2">
              {autoRefresh ? (
                <RefreshCw className="w-4 h-4" />
              ) : (
                <RefreshCwOff className="w-4 h-4" />
              )}
              {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
            </div>
          </button>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 hover:bg-[var(--bg-secondary)] ${
                currentPage === item.id ? 'bg-[var(--bg-secondary)] text-[var(--accent)]' : 'text-[var(--text-primary)]'
              }`}
            >
              <div className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Admin Contact Modal */}
      {showAdminContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-primary)] rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-[var(--accent)]" />
              <h3 className="text-lg font-semibold">Admin Access Required</h3>
            </div>
            <p className="text-[var(--text-secondary)] mb-6">
              You need admin privileges to access this section. Please contact the administrator for access.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAdminContact(false);
                  handleNavigation('contact');
                }}
                className="btn btn-primary px-4 py-2 rounded-md"
              >
                Contact Admin
              </button>
              <button
                onClick={() => setShowAdminContact(false)}
                className="btn btn-secondary px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}