export const ThemePreference = {
  LIGHT: "LIGHT",
  DARK: "DARK",
  SYSTEM: "SYSTEM",
} as const;

export type ThemePreference = (typeof ThemePreference)[keyof typeof ThemePreference];
