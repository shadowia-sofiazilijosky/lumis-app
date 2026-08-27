const NIGHT_START_HOUR = 21; // 21:00 local
const NIGHT_END_HOUR = 6; // until 06:00 local
const DEFAULT_TIMEZONE = 'UTC';

/** Falls back to UTC for an unset/invalid IANA name — Intl throws a
 * RangeError on anything it doesn't recognize, and a user-supplied
 * timezone should never be able to crash a stats calculation. */
export function safeTimezone(timezone: string | null | undefined): string {
  if (!timezone) return DEFAULT_TIMEZONE;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
    return timezone;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

/** "YYYY-MM-DD" for `date` as seen in `timezone` -- the user's local
 * calendar day, independent of the server's own timezone. */
export function localDateKey(
  date: Date,
  timezone: string | null | undefined,
): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: safeTimezone(timezone),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Midnight UTC of the given "YYYY-MM-DD" key -- used as the storage value
 * for ReadingActivityLog.date, so the same local day always maps to the
 * same row regardless of what time within that day the activity happened. */
export function dateKeyToUtcMidnight(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

/** Whether `date`'s local hour (in `timezone`) falls in the night band. */
export function isNightHour(
  date: Date,
  timezone: string | null | undefined,
): boolean {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: safeTimezone(timezone),
      hour: '2-digit',
      hourCycle: 'h23',
    }).format(date),
  );
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}
