"use client";

import type { NotesOverviewBook } from "@lumis/shared-types";
import { ArrowRight, Pin, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { updateHighlight, updateNote } from "@/features/reader/api/annotations-client";
import { formatRelativeTime } from "../lib/format-relative-time";
import { colorForTag } from "../lib/note-tag-colors";

interface Entry {
  kind: "note" | "highlight";
  id: string;
  text: string;
  color: string;
  pageIndex: number;
  pinned: boolean;
}

/** One card per book: a featured quote -- pinned by the user, or (while
 * nothing is pinned) its most recent highlight, falling back to its most
 * recent note -- plus every other note/highlight as a colored post-it.
 * `notes`/`highlights` arrive already sorted most-recent first from the
 * API. */
export function NoteBookCard({
  group,
  onChanged,
}: {
  group: NotesOverviewBook;
  onChanged: () => void;
}) {
  const t = useTranslations("notesPage.card");
  const locale = useLocale();
  const { book, notes, highlights, lastActivityAt } = group;

  const entries: Entry[] = [
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

  const featured =
    entries.find((entry) => entry.pinned) ??
    entries.find((entry) => entry.kind === "highlight") ??
    entries[0] ??
    null;
  const postits = entries.filter((entry) => entry !== featured);

  async function togglePin(entry: Entry) {
    const pinned = !entry.pinned;
    if (entry.kind === "note") {
      await updateNote(book.id, entry.id, { pinned });
    } else {
      await updateHighlight(book.id, entry.id, { pinned });
    }
    onChanged();
  }

  return (
    <article className="note-book-card">
      <Link href={`/read/${book.id}`} className="note-book-card-cover">
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived Supabase URL
          <img src={book.coverUrl} alt="" />
        ) : (
          <span className="note-book-card-cover-fallback">{book.title}</span>
        )}
      </Link>

      <div className="note-book-card-main">
        <Link href={`/read/${book.id}`} className="note-book-card-title-link">
          <h3>{book.title}</h3>
        </Link>
        {book.author && <p className="note-book-card-author">{book.author}</p>}

        {featured && (
          <>
            <div className="note-book-card-featured-tag">
              <Star size={12} fill="currentColor" />
              {t("featuredTag")}
              <button
                type="button"
                className={`note-pin-toggle${featured.pinned ? " note-pin-toggle-active" : ""}`}
                aria-label={featured.pinned ? t("unpin") : t("pin")}
                aria-pressed={featured.pinned}
                onClick={() => togglePin(featured)}
              >
                <Pin size={12} fill={featured.pinned ? "currentColor" : "none"} />
              </button>
            </div>
            <p className="note-book-card-featured-quote">&ldquo;{featured.text}&rdquo;</p>
            <p className="note-book-card-meta">{t("pageLabel", { page: featured.pageIndex + 1 })}</p>
          </>
        )}
      </div>

      {postits.length > 0 && (
        <div className="note-book-card-postits">
          {postits.map((entry) => (
            <div key={entry.id} className="note-postit" style={{ background: entry.color }}>
              <button
                type="button"
                className="note-pin-toggle note-postit-pin"
                aria-label={entry.pinned ? t("unpin") : t("pin")}
                aria-pressed={entry.pinned}
                onClick={() => togglePin(entry)}
              >
                <Pin size={12} fill={entry.pinned ? "currentColor" : "none"} />
              </button>
              <p className="note-postit-body">{entry.text}</p>
              <p className="note-book-card-meta">{t("pageLabel", { page: entry.pageIndex + 1 })}</p>
            </div>
          ))}
        </div>
      )}

      <div className="note-book-card-stats">
        <p className="note-book-card-count">{t("noteCount", { count: entries.length })}</p>
        <p className="note-book-card-last-activity">
          {t("lastActivity", { time: formatRelativeTime(lastActivityAt, locale) })}
        </p>
        <Link href={`/read/${book.id}`} className="note-book-card-viewall">
          {t("viewAll")}
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
