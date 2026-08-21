// Split out from font-cookie.ts (which imports next/headers) so client
// components can read the cookie name without pulling in server-only APIs.
export const FONT_COOKIE = "lumis_font";
export const FONT_OPTIONS = ["LORA", "PLAYFAIR_DISPLAY", "INTER", "CAVEAT"] as const;
export type FontMode = (typeof FONT_OPTIONS)[number];
