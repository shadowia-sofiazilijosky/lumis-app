"use client";

import type { NotesOverviewBook } from "@lumis/shared-types";
import { ArrowRight, MoreVertical, Pin, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { formatRelativeTime } from "../lib/format-relative-time";
import { colorForTag } from "../lib/note-tag-colors";

/** One card per book: a featured quote (its most recent highlight, or --
 * failing that -- its most recent note body) plus every individual note as
 * a colored post-it. `notes`/`highlights` arrive already sorted most-recent
 * first from the API. */
export function NoteBookCard({ group }: { group: NotesOverviewBook }) {
  const t = useTranslations("notesPage.card");
  const locale = useLocale();
  const { book, notes, highlights, lastActivityAt } = group;

  const featured = highlights[0]
    ? { text: highlights[0].selectedText, pageIndex: highlights[0].pageIndex }
    : notes[0]
      ? { text: notes[0].body, pageIndex: notes[0].pageIndex }
      : null;

  return (
    <article className="note-book-card">
      <button type="button" className="note-book-card-menu" aria-label={t("cardMenu")}>
        <MoreVertical size={18} />
      </button>

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
            <span className="note-book-card-featured-tag">
              <Star size={12} fill="currentColor" />
              {t("featuredTag")}
            </span>
            <p className="note-book-card-featured-quote">&ldquo;{featured.text}&rdquo;</p>
            <p className="note-book-card-meta">{t("pageLabel", { page: featured.pageIndex + 1 })}</p>
          </>
        )}
      </div>

      {notes.length > 0 && (
        <div className="note-book-card-postits">
          {notes.map((note) => (
            <div
              key={note.id}
              className="note-postit"
              style={{ background: colorForTag(note.colorTag) }}
            >
              <Pin size={12} className="note-postit-pin" />
              <p className="note-postit-body">{note.body}</p>
              <p className="note-book-card-meta">{t("pageLabel", { page: note.pageIndex + 1 })}</p>
            </div>
          ))}
        </div>
      )}

      <div className="note-book-card-stats">
        <p className="note-book-card-count">{t("noteCount", { count: notes.length })}</p>
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
