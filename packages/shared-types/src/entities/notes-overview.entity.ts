import { Highlight } from "./highlight.entity";
import { Note } from "./note.entity";

/** Trimmed book projection for the Notas overview -- just enough to render
 * a book card (cover, title, author), not the full BookSummary shape. */
export interface NotesOverviewBookInfo {
  id: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
}

export interface NotesOverviewBook {
  book: NotesOverviewBookInfo;
  notes: Note[];
  highlights: Highlight[];
  /** ISO timestamp of the most recent note/highlight activity for this book
   * — the reference point for the "última nota hace X" relative label. */
  lastActivityAt: string;
}

/** One group per book that has at least one note or highlight, sorted by
 * most recent activity first — used to render the Notas list page. */
export interface NotesOverview {
  books: NotesOverviewBook[];
  totalNotes: number;
  totalHighlights: number;
  booksWithNotes: number;
}
