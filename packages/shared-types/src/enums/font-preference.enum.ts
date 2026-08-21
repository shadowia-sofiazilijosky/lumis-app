export const FontPreference = {
  LORA: "LORA",
  PLAYFAIR_DISPLAY: "PLAYFAIR_DISPLAY",
  INTER: "INTER",
  CAVEAT: "CAVEAT",
} as const;

export type FontPreference = (typeof FontPreference)[keyof typeof FontPreference];
