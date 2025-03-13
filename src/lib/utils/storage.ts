// Storage utilities
export const storage = {
  get(key: string): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from storage: ${key}`, error);
      return null;
    }
  },

  set(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in storage: ${key}`, error);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from storage: ${key}`, error);
    }
  },

  clear(preserveKeys: string[] = []): void {
    try {
      const preserved: Record<string, string> = {};
      
      // Save values for preserved keys
      preserveKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) preserved[key] = value;
      });

      // Clear storage
      localStorage.clear();

      // Restore preserved values
      Object.entries(preserved).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  }
};