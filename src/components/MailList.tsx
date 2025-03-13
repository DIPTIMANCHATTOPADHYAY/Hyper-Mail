import React from 'react';
import { Clock, Mail as MailIcon } from 'lucide-react';
import { Email } from '../types';
import { formatEmailTime } from '../utils';

interface MailListProps {
  emails: Email[];
  selectedEmail: Email | null;
  onSelectEmail: (email: Email) => void;
}

export function MailList({ emails, selectedEmail, onSelectEmail }: MailListProps) {
  return (
    <div className="card bg-[var(--bg-secondary)]/50 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-[var(--border)]">
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--accent)]">Mail</h2>
      </div>

      {emails.length === 0 ? (
        <div className="p-8 sm:p-12 text-center">
          <div className="relative">
            <MailIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-[var(--text-secondary)] animate-bounce" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] to-transparent opacity-50" />
          </div>
          <p className="text-lg sm:text-xl font-medium text-[var(--text-primary)]">Your inbox is empty</p>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2">Waiting for incoming emails</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {emails.map((email, index) => {
            const time = formatEmailTime(email.mail_date);
            return (
              <button
                key={email.mail_id}
                onClick={() => onSelectEmail(email)}
                className={`ripple w-full p-3 sm:p-4 text-left transition-all duration-200 
                  ${selectedEmail?.mail_id === email.mail_id 
                    ? 'bg-[var(--bg-secondary)] shadow-inner' 
                    : 'hover:bg-[var(--bg-secondary)]/50'
                  }`}
                style={{
                  animation: `list-item-enter 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s both`
                }}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                  <span className="font-medium text-sm sm:text-base line-clamp-1 group-hover:text-[var(--accent)]">
                    {email.mail_from}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <Clock className="w-3 h-3" />
                    <time 
                      dateTime={new Date(parseInt(email.mail_date) * 1000).toISOString()} 
                      title={time.exact}
                      className="tabular-nums"
                    >
                      {time.relative}
                    </time>
                  </div>
                </div>
                <p className="text-[var(--text-secondary)] text-xs sm:text-sm truncate">
                  {email.mail_subject}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}