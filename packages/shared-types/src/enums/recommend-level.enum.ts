export const RecommendLevel = {
  YES: "YES",
  MAYBE: "MAYBE",
  NO: "NO",
} as const;

export type RecommendLevel = (typeof RecommendLevel)[keyof typeof RecommendLevel];
