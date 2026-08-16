export interface Note {
  id: string;
  userId: string;
  bookId: string;
  highlightId: string | null;
  pageIndex: number;
  offset: number;
  body: string;
  colorTag: string | null;
  /** EPUB only — authoritative anchor for reflowable content. */
  cfi: string | null;
  createdAt: string;
  updatedAt: string;
}
