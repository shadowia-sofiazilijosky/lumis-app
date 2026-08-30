"use client";

import type { BookSummary } from "@lumis/shared-types";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { fetchBooks } from "@/features/books/api/books-client";
import { useNotesOverview } from "../hooks/use-notes-overview";
import { NoteBookCard } from "./note-book-card";
import { NotesControlsBar, type NotesSortMode } from "./notes-controls-bar";
import { NotesEmptyState } from "./notes-empty-state";
import { NotesStatsFooter } from "./notes-stats-footer";

export function NotesView() {
  const t = useTranslations("notesPage");
  const { overview, status } = useNotesOverview();
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [query, setQuery] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("all");
  const [sortMode, setSortMode] = useState<NotesSortMode>("recent");

  useEffect(() => {
    fetchBooks().then(setBooks);
  }, []);

  const filteredGroups = useMemo(() => {
    if (!overview) return [];
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = overview.books.filter((group) => {
      if (selectedBookId !== "all" && group.book.id !== selectedBookId) {
        return false;
      }
      if (!normalizedQuery) return true;

      const haystack = [
        group.book.title,
        group.book.author ?? "",
        ...group.notes.map((note) => note.body),
        ...group.highlights.map((highlight) => highlight.selectedText),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });

    const sorted = [...filtered].sort((a, b) =>
      sortMode === "recent"
        ? b.lastActivityAt.localeCompare(a.lastActivityAt)
        : a.lastActivityAt.localeCompare(b.lastActivityAt),
    );

    return sorted;
  }, [overview, query, selectedBookId, sortMode]);

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

  if (overview.books.length === 0) {
    return (
      <section className="notes-page">
        <div className="notes-page-header">
          <h1>{t("heading")}</h1>
          <div className="notes-title-divider" aria-hidden="true">
            <span className="notes-divider-line" />
            <Sparkles size={14} className="notes-divider-icon" />
          </div>
        </div>
        <NotesEmptyState />
      </section>
    );
  }

  return (
    <section className="notes-page">
      <div className="notes-page-header notes-page-header-with-content">
        <div>
          <h1>{t("heading")}</h1>
          <div className="notes-title-divider" aria-hidden="true">
            <span className="notes-divider-line" />
            <Sparkles size={14} className="notes-divider-icon" />
          </div>
        </div>

        <NotesControlsBar
          query={query}
          onQueryChange={setQuery}
          books={books}
          selectedBookId={selectedBookId}
          onSelectedBookIdChange={setSelectedBookId}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
        />
      </div>

      <div className="notes-book-list">
        {filteredGroups.length === 0 ? (
          <p className="notes-no-results">{t("noResults")}</p>
        ) : (
          filteredGroups.map((group) => <NoteBookCard key={group.book.id} group={group} />)
        )}
      </div>

      <NotesStatsFooter
        totalNotes={overview.totalNotes}
        booksWithNotes={overview.booksWithNotes}
        totalHighlights={overview.totalHighlights}
      />
    </section>
  );
}
