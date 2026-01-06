/**
 * Parse a date string (YYYY-MM-DD) to a Date object at midnight UTC
 * This ensures consistent date handling across timezones
 */
export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Get today's date at midnight UTC
 */
export function getTodayUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
}

/**
 * Format a Date object to YYYY-MM-DD string in UTC
 */
export function formatDateUTC(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Get a date N days ago at midnight UTC
 */
export function getDaysAgoUTC(days: number): Date {
  const today = getTodayUTC();
  today.setUTCDate(today.getUTCDate() - days);
  return today;
}

/**
 * Get today's date at midnight in the user's timezone, returned as UTC
 * This converts the user's local "today" to a UTC date for storage
 */
export function getTodayInTimezone(timezone: string): Date {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find((p) => p.type === "year")!.value);
  const month = parseInt(parts.find((p) => p.type === "month")!.value);
  const day = parseInt(parts.find((p) => p.type === "day")!.value);

  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Format a UTC date to YYYY-MM-DD string
 * Since we store dates as "midnight UTC representing a calendar day",
 * we just extract the UTC date parts directly
 */
export function formatDateInTimezone(date: Date, timezone: string): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Parse a date string (YYYY-MM-DD) in the user's timezone to a UTC Date
 */
export function parseDateInTimezone(
  dateString: string,
  timezone: string,
): Date {
  const [year, month, day] = dateString.split("-").map(Number);

  // Create the date at midnight in the user's timezone
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00`;

  // Parse it as if it's in the user's timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // The date at midnight in the user's timezone
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Get N days ago in the user's timezone, returned as UTC
 */
export function getDaysAgoInTimezone(days: number, timezone: string): Date {
  const today = getTodayInTimezone(timezone);
  today.setUTCDate(today.getUTCDate() - days);
  return today;
}
