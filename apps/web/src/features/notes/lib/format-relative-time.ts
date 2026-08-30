const UNITS: { limit: number; divisor: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { limit: 60, divisor: 1, unit: "second" },
  { limit: 3600, divisor: 60, unit: "minute" },
  { limit: 86400, divisor: 3600, unit: "hour" },
  { limit: 604800, divisor: 86400, unit: "day" },
  { limit: 2629800, divisor: 604800, unit: "week" },
  { limit: 31557600, divisor: 2629800, unit: "month" },
  { limit: Infinity, divisor: 31557600, unit: "year" },
];

/** "hace 2 días" / "2 days ago" / etc, entirely via Intl.RelativeTimeFormat
 * -- locale-correct for all 20 supported languages with no translation
 * strings of our own, and always computed against the real current time
 * (never a fixed/hardcoded value). */
export function formatRelativeTime(iso: string, locale: string): string {
  const diffSeconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const absSeconds = Math.abs(diffSeconds);
  const { divisor, unit } = UNITS.find((u) => absSeconds < u.limit) ?? UNITS[UNITS.length - 1];
  const value = Math.round(diffSeconds / divisor);
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(value, unit);
}
