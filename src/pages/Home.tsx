import React from 'react';
import { Email } from '../types';
import { MailList } from '../components/MailList';
import { EmailViewer } from '../components/EmailViewer';

interface HomeProps {
  emails: Email[];
  selectedEmail: Email | null;
  onSelectEmail: (email: Email) => void;
}

export function Home({ emails, selectedEmail, onSelectEmail }: HomeProps) {
  return (
    <div className="space-y-6">
      <MailList emails={emails} selectedEmail={selectedEmail} onSelectEmail={onSelectEmail} />
      {selectedEmail && <EmailViewer email={selectedEmail} />}
    </div>
  );
}