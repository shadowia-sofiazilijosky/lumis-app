import type { Highlight, Note } from "@lumis/shared-types";
import { colorForTag } from "./note-tag-colors";

/** A note and a highlight both render as a post-it -- this is the common
 * shape the card/book-detail views actually draw from, instead of each
 * juggling two separate arrays with different field names. */
export interface NoteEntry {
  kind: "note" | "highlight";
  id: string;
  text: string;
  color: string;
  pageIndex: number;
  pinned: boolean;
}

/** `notes`/`highlights` arrive already sorted most-recent-first from the
 * API -- concatenating keeps that order within each kind. */
export function buildEntries(notes: Note[], highlights: Highlight[]): NoteEntry[] {
  return [
    ...notes.map((note) => ({
      kind: "note" as const,
      id: note.id,
      text: note.body,
      color: colorForTag(note.colorTag),
      pageIndex: note.pageIndex,
      pinned: note.pinned,
    })),
    ...highlights.map((highlight) => ({
      kind: "highlight" as const,
      id: highlight.id,
      text: highlight.selectedText,
      color: highlight.color,
      pageIndex: highlight.pageIndex,
      pinned: highlight.pinned,
    })),
  ];
}

/** Whichever entry the user pinned, or -- while nothing is pinned -- the
 * most recent highlight, falling back to the most recent note. */
export function pickFeatured(entries: NoteEntry[]): NoteEntry | null {
  return (
    entries.find((entry) => entry.pinned) ??
    entries.find((entry) => entry.kind === "highlight") ??
    entries[0] ??
    null
  );
}
