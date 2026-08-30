"use client";

import type { NotesOverviewBook } from "@lumis/shared-types";
import { ArrowRight, Pin, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { updateHighlight, updateNote } from "@/features/reader/api/annotations-client";
import { buildEntries, pickFeatured } from "../lib/entries";
import { formatRelativeTime } from "../lib/format-relative-time";
import { NotePostit } from "./note-postit";

/** One card per book: a featured quote -- pinned by the user, or (while
 * nothing is pinned) its most recent highlight, falling back to its most
 * recent note -- plus every other note/highlight as a colored post-it.
 * "Ver todas" opens the full per-book list (BookNotesView), not the reader. */
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

  const entries = buildEntries(notes, highlights);
  const featured = pickFeatured(entries);
  const postits = entries.filter((entry) => entry !== featured);

  async function toggleFeaturedPin() {
    if (!featured) return;
    const pinned = !featured.pinned;
    if (featured.kind === "note") {
      await updateNote(book.id, featured.id, { pinned });
    } else {
      await updateHighlight(book.id, featured.id, { pinned });
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
                onClick={toggleFeaturedPin}
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
            <NotePostit key={entry.id} entry={entry} bookId={book.id} onChanged={onChanged} />
          ))}
        </div>
      )}

      <div className="note-book-card-stats">
        <p className="note-book-card-count">{t("noteCount", { count: entries.length })}</p>
        <p className="note-book-card-last-activity">
          {t("lastActivity", { time: formatRelativeTime(lastActivityAt, locale) })}
        </p>
        <Link href={`/notes/${book.id}`} className="note-book-card-viewall">
          {t("viewAll")}
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
