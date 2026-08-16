export const HighlightColor = {
  YELLOW: "YELLOW",
  PINK: "PINK",
  GREEN: "GREEN",
  BLUE: "BLUE",
} as const;

export type HighlightColor = (typeof HighlightColor)[keyof typeof HighlightColor];
