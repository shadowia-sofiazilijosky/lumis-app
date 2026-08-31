import { ReaderTheme } from "../enums/reader-theme.enum";

export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  currentPage: number;
  currentLocator: unknown;
  progressPercent: number;
  readerTheme: ReaderTheme;
  /** "horizontal" | "vertical" | "flip". */
  pageTurnMode: string;
  readingRulerEnabled: boolean;
  updatedAt: string;
}
