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
  /** At most one pinned note/highlight per book — the Notas page's
   * "featured quote" for that book. */
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}
