export interface Highlight {
  id: string;
  userId: string;
  bookId: string;
  /** 6- or 8-digit hex (#RRGGBB[AA]) — free spectrum, not a fixed palette. */
  color: string;
  /** Highlighter-pen stroke thickness: "thin" | "normal" | "thick". */
  size: string;
  pageIndex: number;
  startOffset: number;
  endOffset: number;
  selectedText: string;
  /** EPUB only — authoritative anchor for reflowable content. */
  cfi: string | null;
  /** At most one pinned note/highlight per book — the Notas page's
   * "featured quote" for that book. */
  pinned: boolean;
  createdAt: string;
}
