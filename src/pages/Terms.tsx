import React from 'react';
import { ScrollText, Shield, AlertTriangle, Ban } from 'lucide-react';

export function Terms() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-[var(--accent)]">Terms and Conditions</h2>
        <p className="text-[var(--text-secondary)]">Last updated: March 14, 2024</p>
      </div>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ScrollText className="w-6 h-6 text-[var(--accent)]" />
            <h3 className="text-xl font-semibold m-0">1. Agreement to Terms</h3>
          </div>
          <p>
            By accessing or using Hyper Mail ("the Service"), you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the Service.
          </p>
        </div>

        <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-[var(--accent)]" />
            <h3 className="text-xl font-semibold m-0">2. Service Description</h3>
          </div>
          <p>
            Hyper Mail provides temporary email services for users. These email addresses are:
          </p>
          <ul>
            <li>Temporary and will expire after a set period</li>
            <li>Not intended for permanent communication</li>
            <li>Provided on an "as is" and "as available" basis</li>
            <li>Subject to deletion without prior notice</li>
          </ul>
        </div>

        <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Ban className="w-6 h-6 text-[var(--accent)]" />
            <h3 className="text-xl font-semibold m-0">3. Prohibited Uses</h3>
          </div>
          <p>You agree not to use the Service for:</p>
          <ul>
            <li>Any unlawful purpose or to solicit the performance of any illegal activity</li>
            <li>Harassment, abuse, or threatening behavior</li>
            <li>Transmitting viruses, malware, or other malicious code</li>
            <li>Interfering with or disrupting the integrity of the Service</li>
            <li>Collecting or tracking personal information of others</li>
            <li>Spamming, phishing, or other fraudulent activities</li>
          </ul>
        </div>

        <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-[var(--accent)]" />
            <h3 className="text-xl font-semibold m-0">4. Limitation of Liability</h3>
          </div>
          <p>
            To the maximum extent permitted by law, Hyper Mail shall not be liable for:
          </p>
          <ul>
            <li>Any indirect, incidental, special, consequential, or punitive damages</li>
            <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
            <li>Any damages resulting from interruption of service</li>
            <li>Any damages resulting from unauthorized access to or use of our servers</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-semibold">5. Intellectual Property</h3>
          <p>
            The Service and its original content, features, and functionality are owned by Hyper Mail and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>

          <h3 className="text-xl font-semibold">6. Termination</h3>
          <p>
            We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h3 className="text-xl font-semibold">7. Changes to Terms</h3>
          <p>
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
          </p>

          <h3 className="text-xl font-semibold">8. Contact Information</h3>
          <p>
            If you have any questions about these Terms, please contact us at support@hypercrx.live.
          </p>
        </div>

        <div className="mt-8 p-4 bg-[var(--accent)]/10 rounded-lg">
          <p className="text-sm text-[var(--text-secondary)] m-0">
            By using Hyper Mail, you acknowledge that you have read and understood these Terms and Conditions and agree to be bound by them.
          </p>
        </div>
      </div>
    </div>
  );
}