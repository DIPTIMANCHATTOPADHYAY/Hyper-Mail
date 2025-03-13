import React from 'react';
import { Shield, Zap, Users, Lock } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[var(--accent)]/10 rounded-lg">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}

export function About() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--accent)]">About Hyper Mail</h2>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
          Pioneering privacy-focused email solutions since 2024, making secure communication accessible to everyone.
        </p>
      </div>

      {/* Mission Section */}
      <div className="bg-[var(--bg-secondary)]/50 p-6 sm:p-8 rounded-lg">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
          <div className="prose prose-lg dark:prose-invert">
            <p>
              At Hyper Mail, we're committed to protecting your digital privacy in an increasingly connected world. 
              Our mission is to provide a secure, reliable, and user-friendly temporary email service that helps 
              users maintain control over their online identity while preventing spam and unwanted communications.
            </p>
            <p>
              We believe that everyone deserves access to tools that protect their privacy online. That's why we've 
              created a service that's both powerful and easy to use, making secure communication accessible to 
              everyone, regardless of their technical expertise.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard
          icon={<Shield className="w-6 h-6 text-[var(--accent)]" />}
          title="Privacy First"
          description="Your security is our top priority. Our temporary email addresses help protect your real inbox from spam and potential security threats."
        />
        <FeatureCard
          icon={<Zap className="w-6 h-6 text-[var(--accent)]" />}
          title="Instant Access"
          description="No registration required. Get a secure, temporary email address instantly and start receiving messages right away."
        />
        <FeatureCard
          icon={<Users className="w-6 h-6 text-[var(--accent)]" />}
          title="User Focused"
          description="Built with users in mind, offering an intuitive interface that makes managing temporary emails effortless."
        />
        <FeatureCard
          icon={<Lock className="w-6 h-6 text-[var(--accent)]" />}
          title="Secure by Design"
          description="Advanced security measures ensure your temporary communications remain private and protected."
        />
      </div>

      {/* Why Choose Us */}
      <div className="bg-[var(--bg-secondary)]/50 p-6 sm:p-8 rounded-lg">
        <h3 className="text-2xl font-bold mb-6">Why Choose Hyper Mail?</h3>
        <div className="space-y-4">
          <div className="prose prose-lg dark:prose-invert">
            <ul>
              <li>
                <strong>No Registration Required:</strong> Get started instantly without creating an account or sharing personal information.
              </li>
              <li>
                <strong>Automatic Cleanup:</strong> All temporary emails and data are automatically deleted after expiration, leaving no trace.
              </li>
              <li>
                <strong>User-Friendly Interface:</strong> Our clean, intuitive design makes it easy to manage your temporary email needs.
              </li>
              <li>
                <strong>24/7 Availability:</strong> Our service is always available when you need it, providing reliable temporary email addresses around the clock.
              </li>
              <li>
                <strong>Multiple Email Support:</strong> Generate multiple temporary email addresses as needed, with no limitations.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Team Values */}
      <div className="text-center space-y-6">
        <h3 className="text-2xl font-bold">Our Values</h3>
        <div className="max-w-2xl mx-auto text-[var(--text-secondary)]">
          <p>
            We're driven by our commitment to privacy, security, and user empowerment. Our team works tirelessly 
            to maintain a service that our users can trust, constantly improving and adapting to new security 
            challenges in the digital world.
          </p>
        </div>
      </div>
    </div>
  );
}