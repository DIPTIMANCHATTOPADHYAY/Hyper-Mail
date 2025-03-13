import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Mail, Clock, User } from 'lucide-react';
import { Email } from '../types';
import { formatEmailTime } from '../utils';

interface EmailViewerProps {
  email: Email;
}

export function EmailViewer({ email }: EmailViewerProps) {
  const time = formatEmailTime(email.mail_date);
  
  // Clean and prepare the email content
  const cleanContent = email.content.mail_body
    .replace(/<style[^>]*>.*?<\/style>/gs, '') // Remove style tags
    .replace(/<script[^>]*>.*?<\/script>/gs, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
    .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
    .trim();

  return (
    <div className="bg-[var(--bg-secondary)]/50 rounded-lg overflow-hidden shadow-lg">
      {/* Email Header */}
      <div className="p-4 sm:p-6 border-b border-[var(--border)]">
        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--accent)] mb-4">
          {email.mail_subject || 'No Subject'}
        </h2>
        
        <div className="space-y-2">
          {/* From */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <User className="w-4 h-4" />
            <span className="font-medium">From:</span>
            <span>{email.mail_from}</span>
          </div>
          
          {/* Time */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Received:</span>
            <time 
              dateTime={new Date(parseInt(email.mail_date) * 1000).toISOString()}
              title={time.exact}
            >
              {time.exact}
            </time>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="p-4 sm:p-6">
        <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
          {cleanContent.split('\n').map((paragraph, index) => (
            paragraph.trim() && (
              <p key={index} className="mb-4 last:mb-0 text-[var(--text-primary)]">
                {paragraph}
              </p>
            )
          ))}
        </div>
      </div>
    </div>
  );
}