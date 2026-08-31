import { ReaderTheme } from "../enums/reader-theme.enum";

export interface UpdateReadingProgressDto {
  currentPage?: number;
  currentLocator?: unknown;
  progressPercent?: number;
  readerTheme?: ReaderTheme;
  /** "horizontal" | "vertical" | "flip". */
  pageTurnMode?: string;
  readingRulerEnabled?: boolean;
}
