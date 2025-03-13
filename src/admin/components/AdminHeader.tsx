import React from 'react';
import { Settings } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function AdminHeader({ title, children }: AdminHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-[var(--accent)]" />
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </div>
  );
}