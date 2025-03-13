import { format, formatDistanceToNow } from 'date-fns';

// Date formatting utilities
export const dateUtils = {
  formatEmailTime: (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

    return {
      relative: diffInHours < 24 
        ? format(date, 'HH:mm')
        : format(date, 'MMM d'),
      exact: format(date, 'MMM d, yyyy HH:mm')
    };
  },

  formatRelativeTime: (date: Date | number): string => {
    return formatDistanceToNow(date, { addSuffix: true });
  },

  formatDateTime: (date: Date | number): string => {
    return format(date, 'MMM d, yyyy HH:mm:ss');
  },

  isExpired: (date: Date | number): boolean => {
    return new Date(date).getTime() < Date.now();
  }
};