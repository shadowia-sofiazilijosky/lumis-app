export const ReaderTheme = {
  LIGHT: "LIGHT",
  DARK: "DARK",
  SEPIA: "SEPIA",
} as const;

export type ReaderTheme = (typeof ReaderTheme)[keyof typeof ReaderTheme];
