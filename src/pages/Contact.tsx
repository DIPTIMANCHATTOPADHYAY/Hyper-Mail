import React, { useState } from 'react';
import { Mail, MessageSquare, Send, AlertCircle } from 'lucide-react';

export function Contact() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending message
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Message sent successfully!');
    setSubject('');
    setMessage('');
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--accent)]">Contact Us</h2>
      
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="font-semibold">Email Support</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            For general inquiries and support:
          </p>
          <a
            href="mailto:support@hypercrx.live"
            className="text-[var(--accent)] hover:underline"
          >
            support@hypercrx.live
          </a>
        </div>

        <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="font-semibold">Admin Contact</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            For admin access requests:
          </p>
          <a
            href="mailto:admin@hypercrx.live"
            className="text-[var(--accent)] hover:underline"
          >
            admin@hypercrx.live
          </a>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="font-semibold">Send us a Message</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]"
              placeholder="Enter subject"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] min-h-[150px]"
              placeholder="Enter your message"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-6 py-2 rounded-lg flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}