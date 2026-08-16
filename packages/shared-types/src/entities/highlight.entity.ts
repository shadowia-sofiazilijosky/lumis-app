import { HighlightColor } from "../enums/highlight-color.enum";

export interface Highlight {
  id: string;
  userId: string;
  bookId: string;
  color: HighlightColor;
  pageIndex: number;
  startOffset: number;
  endOffset: number;
  selectedText: string;
  /** EPUB only — authoritative anchor for reflowable content. */
  cfi: string | null;
  createdAt: string;
}
