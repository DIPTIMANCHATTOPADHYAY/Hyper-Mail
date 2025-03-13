import React from 'react';
import { Shield, Eye, Lock, Trash2, Bell, Server } from 'lucide-react';

export function Privacy() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-[var(--accent)]">Privacy Policy</h2>
        <p className="text-[var(--text-secondary)]">Last updated: March 14, 2024</p>
      </div>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        {/* Introduction */}
        <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-[var(--accent)]" />
            <h3 className="text-xl font-semibold m-0">Introduction</h3>
          </div>
          <p>
            At Hyper Mail, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you use our temporary email service. Please read 
            this privacy policy carefully. By using the service, you consent to the practices described in 
            this policy.
          </p>
        </div>

        {/* Information Collection */}
        <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-[var(--accent)]" />
            <h3 className="text-xl font-semibold m-0">Information Collection</h3>
          </div>
          <h4>Automatically Collected Information:</h4>
          <ul>
            <li>Temporary email addresses generated through our service</li>
            <li>Messages received during your session</li>
            <li>Browser type and version</li>
            <li>Access times and dates</li>
            <li>Pages viewed within our service</li>
            <li>IP address (anonymized)</li>
          </ul>
          <p className="text-[var(--text-secondary)] mt-4">
            We do not collect or store any personal identification information unless explicitly provided by you.
          </p>
        </div>

        {/* Data Usage */}
        <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Server className="w-6 h-6 text-[var(--accent)]" />
            <h3 className="text-xl font-semibold m-0">How We Use Your Information</h3>
          </div>
          <p>We use the collected information solely for:</p>
          <ul>
            <li>Providing and maintaining the temporary email service</li>
            <li>Improving and optimizing our service</li>
            <li>Analyzing usage patterns to enhance user experience</li>
            <li>Preventing abuse and maintaining security</li>
            <li>Complying with legal obligations</li>
          </ul>
        </div>

        {/* Data Security */}
        <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-[var(--accent)]" />
            <h3 className="text-xl font-semibold m-0">Data Security</h3>
          </div>
          <p>
            We implement appropriate technical and organizational security measures to protect your information:
          </p>
          <ul>
            <li>End-to-end encryption for all email communications</li>
            <li>Regular security audits and updates</li>
            <li>Secure data transmission using SSL/TLS encryption</li>
            <li>Access controls and authentication mechanisms</li>
            <li>Regular monitoring for potential security threats</li>
          </ul>
        </div>

        {/* Data Retention */}
        <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-6 h-6 text-[var(--accent)]" />
            <h3 className="text-xl font-semibold m-0">Data Retention and Deletion</h3>
          </div>
          <p>Our data retention policies ensure your privacy:</p>
          <ul>
            <li>Temporary email addresses are automatically deleted after session expiration</li>
            <li>All received emails are permanently deleted after the specified retention period</li>
            <li>No backups of expired emails or addresses are maintained</li>
            <li>Usage logs are anonymized and deleted after 30 days</li>
          </ul>
        </div>

        {/* Updates to Privacy Policy */}
        <div className="bg-[var(--bg-secondary)]/50 p-6 rounded-lg mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-[var(--accent)]" />
            <h3 className="text-xl font-semibold m-0">Updates to This Policy</h3>
          </div>
          <p>
            We may update this privacy policy from time to time. We will notify users of any material changes by:
          </p>
          <ul>
            <li>Posting the new privacy policy on this page</li>
            <li>Updating the "Last updated" date at the top of this page</li>
            <li>Displaying a notice within the service when applicable</li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Contact Us</h3>
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact us at:
          </p>
          <ul>
            <li>Email: privacy@hypercrx.live</li>
            <li>Website: https://hypercrx.live/contact</li>
          </ul>
        </div>

        <div className="mt-8 p-4 bg-[var(--accent)]/10 rounded-lg">
          <p className="text-sm text-[var(--text-secondary)] m-0">
            By using Hyper Mail, you acknowledge that you have read and understood this Privacy Policy and agree 
            to its terms.
          </p>
        </div>
      </div>
    </div>
  );
}