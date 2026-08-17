// Split out from theme-cookie.ts (which imports next/headers) so client
// components can read the cookie name without pulling in server-only APIs.
export const THEME_COOKIE = "lumis_theme";
export type ThemeMode = "light" | "dark";
