/**
 * Calculate the difference in days between two dates
 */
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const diffTime = date2.getTime() - date1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if a date is within the specified number of days from now
 */
export const isWithinDays = (date: Date, days: number): boolean => {
  const now = new Date();
  const diffDays = getDaysDifference(date, now);
  return diffDays <= days;
};
