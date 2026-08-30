"use client";

import { ArrowLeft, Pin, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { updateHighlight, updateNote } from "@/features/reader/api/annotations-client";
import { useNotesOverview } from "../hooks/use-notes-overview";
import { buildEntries, pickFeatured } from "../lib/entries";
import { formatRelativeTime } from "../lib/format-relative-time";
import { NotePostit } from "./note-postit";

/** The "Ver todas" destination for one book -- every note and highlight for
 * it, not just what fits in the shelf-of-cards Notas list. */
export function BookNotesView({ bookId }: { bookId: string }) {
  const t = useTranslations("notesPage");
  const tCard = useTranslations("notesPage.card");
  const locale = useLocale();
  const { overview, status, refetch } = useNotesOverview();

  if (status === "loading") {
    return (
      <section className="notes-page">
        <p>{t("loading")}</p>
      </section>
    );
  }

  if (status === "error" || !overview) {
    return (
      <section className="notes-page">
        <p>{t("loadError")}</p>
      </section>
    );
  }

  const group = overview.books.find((entry) => entry.book.id === bookId);

  if (!group) {
    return (
      <section className="notes-page">
        <Link href="/notes" className="note-book-detail-back">
          <ArrowLeft size={16} />
          {t("bookDetail.back")}
        </Link>
        <p>{t("bookDetail.empty")}</p>
      </section>
    );
  }

  const { book, notes, highlights, lastActivityAt } = group;
  const entries = buildEntries(notes, highlights);
  const featured = pickFeatured(entries);
  const rest = entries.filter((entry) => entry !== featured);

  async function toggleFeaturedPin() {
    if (!featured) return;
    const pinned = !featured.pinned;
    if (featured.kind === "note") {
      await updateNote(book.id, featured.id, { pinned });
    } else {
      await updateHighlight(book.id, featured.id, { pinned });
    }
    refetch();
  }

  return (
    <section className="notes-page">
      <Link href="/notes" className="note-book-detail-back">
        <ArrowLeft size={16} />
        {t("bookDetail.back")}
      </Link>

      <div className="note-book-detail-header">
        <div className="note-book-card-cover note-book-detail-cover">
          {book.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived Supabase URL
            <img src={book.coverUrl} alt="" />
          ) : (
            <span className="note-book-card-cover-fallback">{book.title}</span>
          )}
        </div>
        <div>
          <h1>{book.title}</h1>
          {book.author && <p className="note-book-card-author">{book.author}</p>}
          <p className="note-book-card-last-activity">
            {tCard("noteCount", { count: entries.length })} ·{" "}
            {tCard("lastActivity", { time: formatRelativeTime(lastActivityAt, locale) })}
          </p>
        </div>
      </div>

      {featured && (
        <div className="note-book-detail-featured">
          <div className="note-book-card-featured-tag">
            <Star size={12} fill="currentColor" />
            {tCard("featuredTag")}
            <button
              type="button"
              className={`note-pin-toggle${featured.pinned ? " note-pin-toggle-active" : ""}`}
              aria-label={featured.pinned ? tCard("unpin") : tCard("pin")}
              aria-pressed={featured.pinned}
              onClick={toggleFeaturedPin}
            >
              <Pin size={12} fill={featured.pinned ? "currentColor" : "none"} />
            </button>
          </div>
          <p className="note-book-card-featured-quote">&ldquo;{featured.text}&rdquo;</p>
          <p className="note-book-card-meta">
            {tCard("pageLabel", { page: featured.pageIndex + 1 })}
          </p>
        </div>
      )}

      {rest.length > 0 && (
        <div className="note-book-detail-postits">
          {rest.map((entry) => (
            <NotePostit key={entry.id} entry={entry} bookId={book.id} onChanged={refetch} />
          ))}
        </div>
      )}
    </section>
  );
}
