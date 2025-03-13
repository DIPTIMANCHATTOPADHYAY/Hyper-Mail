import React from 'react';
import { X } from 'lucide-react';
import { toast, ToastBar, Toaster } from 'react-hot-toast';

export function Toast() {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        className: 'toast-animation',
        duration: 3000,
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div className="flex items-center gap-2 p-2 min-w-[300px]">
              <span className="flex-shrink-0">{icon}</span>
              <span className="flex-1">{message}</span>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="p-1 rounded-full hover:bg-[var(--bg-primary)] transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}