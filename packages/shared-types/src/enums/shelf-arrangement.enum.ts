export const ShelfArrangement = {
  SPINE: "SPINE",
  COVER: "COVER",
} as const;

export type ShelfArrangement =
  (typeof ShelfArrangement)[keyof typeof ShelfArrangement];
