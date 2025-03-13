import React, { useState } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { authService } from '../../services/authService';
import { toast } from 'react-hot-toast';

interface UserMenuProps {
  email: string;
  onShowSettings: () => void;
}

export function UserMenu({ email, onShowSettings }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');

  React.useEffect(() => {
    const loadUserName = async () => {
      const { data: { user } } = await authService.getCurrentUser();
      if (user?.user_metadata) {
        const { first_name, last_name } = user.user_metadata;
        if (first_name && last_name) {
          setDisplayName(`${first_name} ${last_name}`);
        } else {
          setDisplayName(email.split('@')[0]);
        }
      } else {
        setDisplayName(email.split('@')[0]);
      }
    };
    loadUserName();
  }, [email]);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
      >
        <User className="w-5 h-5" />
        <span className="hidden sm:block text-sm truncate max-w-[150px]">{displayName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[var(--bg-primary)] rounded-lg shadow-lg border border-[var(--border)] overflow-hidden">
          <div className="p-3 border-b border-[var(--border)]">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-[var(--text-secondary)] truncate">{email}</p>
          </div>
          <div className="p-2">
            <button
              onClick={() => {
                onShowSettings();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <Settings className="w-4 h-4" />
              Account Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-[var(--bg-secondary)] text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}