import { BookFormat } from "../enums/book-format.enum";

/** Trimmed book projection used by pickers and shelf rendering (not the full Library detail shape). */
export interface BookSummary {
  id: string;
  title: string;
  author: string | null;
  format: BookFormat;
  pageCount: number | null;
  coverUrl: string | null;
}
