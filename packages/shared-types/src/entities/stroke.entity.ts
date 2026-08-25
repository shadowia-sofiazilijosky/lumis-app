export interface Stroke {
  id: string;
  userId: string;
  bookId: string;
  pageIndex: number;
  /** [[x, y], ...] normalized 0-1 against the page's own width/height. */
  points: [number, number][];
  /** 6- or 8-digit hex (#RRGGBB[AA]). */
  color: string;
  brush: string;
  size: number;
  createdAt: string;
}
