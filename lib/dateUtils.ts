/**
 * Parse a date string (YYYY-MM-DD) to a Date object at midnight UTC
 * This ensures consistent date handling across timezones
 */
export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Get today's date at midnight UTC
 */
export function getTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Format a Date object to YYYY-MM-DD string in UTC
 */
export function formatDateUTC(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get a date N days ago at midnight UTC
 */
export function getDaysAgoUTC(days: number): Date {
  const today = getTodayUTC();
  today.setUTCDate(today.getUTCDate() - days);
  return today;
}
