
// Time validation utilities
export const timeValidation = {
  // Check if time is at least 30 minutes from now
  isAtLeast30MinutesFromNow: (date: Date, time: string): boolean => {
    const now = new Date();
    const targetDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    targetDateTime.setHours(hours, minutes, 0, 0);
    
    const diffInMinutes = (targetDateTime.getTime() - now.getTime()) / (1000 * 60);
    return diffInMinutes >= 30;
  },

  // Check if time is at least 2 hours from now
  isAtLeast2HoursFromNow: (date: Date, time: string): boolean => {
    const now = new Date();
    const targetDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    targetDateTime.setHours(hours, minutes, 0, 0);
    
    const diffInHours = (targetDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffInHours >= 2;
  },

  // Check if datetime is in the past
  isPastDateTime: (date: Date, time?: string): boolean => {
    const now = new Date();
    const targetDateTime = new Date(date);
    
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      targetDateTime.setHours(hours, minutes, 0, 0);
    }
    
    return targetDateTime < now;
  },

  // Get minimum allowed date (today)
  getMinimumAllowedDate: (): string => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
};
