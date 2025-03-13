// Made by Hyper Crx
import { format } from 'date-fns';

export const formatEmailTime = (timestamp: string) => {
  const date = new Date(parseInt(timestamp) * 1000);
  const now = new Date();
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

  return {
    relative: diffInHours < 24 
      ? format(date, 'HH:mm')
      : format(date, 'MMM d'),
    exact: format(date, 'MMM d, yyyy HH:mm')
  };
};