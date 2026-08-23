import { BookFormat } from "../enums/book-format.enum";

/** Trimmed book projection used by pickers and shelf rendering (not the full Library detail shape). */
export interface BookSummary {
  id: string;
  title: string;
  author: string | null;
  format: BookFormat;
  pageCount: number | null;
  coverUrl: string | null;
  progressPercent: number;
}

/** Full book shape for the Library grid/detail views. */
export interface BookDetail {
  id: string;
  title: string;
  author: string | null;
  format: BookFormat;
  pageCount: number | null;
  fileSizeBytes: number | null;
  metadata: Record<string, unknown> | null;
  fileUrl: string | null;
  coverUrl: string | null;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}
