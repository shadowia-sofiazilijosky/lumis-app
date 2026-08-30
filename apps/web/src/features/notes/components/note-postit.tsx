"use client";

import { Pin } from "lucide-react";
import { useTranslations } from "next-intl";
import { updateHighlight, updateNote } from "@/features/reader/api/annotations-client";
import type { NoteEntry } from "../lib/entries";

/** One post-it -- a note or a highlight, same shape either way (see
 * NoteEntry) -- with a working pin toggle: pinning it unpins every other
 * note/highlight on the same book (server-enforced), then refetches so the
 * card that made this and whichever card is showing it as "featured" both
 * land in sync. Shared by the shelf-of-cards Notas list and the per-book
 * "Ver todas" page. */
export function NotePostit({
  entry,
  bookId,
  onChanged,
}: {
  entry: NoteEntry;
  bookId: string;
  onChanged: () => void;
}) {
  const t = useTranslations("notesPage.card");

  async function togglePin() {
    const pinned = !entry.pinned;
    if (entry.kind === "note") {
      await updateNote(bookId, entry.id, { pinned });
    } else {
      await updateHighlight(bookId, entry.id, { pinned });
    }
    onChanged();
  }

  return (
    <div className="note-postit" style={{ background: entry.color }}>
      <button
        type="button"
        className="note-pin-toggle note-postit-pin"
        aria-label={entry.pinned ? t("unpin") : t("pin")}
        aria-pressed={entry.pinned}
        onClick={togglePin}
      >
        <Pin size={12} fill={entry.pinned ? "currentColor" : "none"} />
      </button>
      <p className="note-postit-body">{entry.text}</p>
      <p className="note-book-card-meta">{t("pageLabel", { page: entry.pageIndex + 1 })}</p>
    </div>
  );
}
