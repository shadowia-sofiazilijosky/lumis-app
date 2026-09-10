"use client";

import type { BookSummary } from "@lumis/shared-types";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

export type NotesSortMode = "recent" | "oldest";

interface NotesControlsBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  books: BookSummary[];
  selectedBookId: string;
  onSelectedBookIdChange: (value: string) => void;
  sortMode: NotesSortMode;
  onSortModeChange: (value: NotesSortMode) => void;
}

export function NotesControlsBar({
  query,
  onQueryChange,
  books,
  selectedBookId,
  onSelectedBookIdChange,
  sortMode,
  onSortModeChange,
}: NotesControlsBarProps) {
  const t = useTranslations("notesPage.controls");

  return (
    <div className="notes-controls-bar">
      <div className="notes-search">
        <Search size={16} className="notes-search-icon" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
        />
      </div>

      <div className="notes-select">
        <select
          value={selectedBookId}
          onChange={(event) => onSelectedBookIdChange(event.target.value)}
          aria-label={t("filterAllBooks")}
        >
          <option value="all">{t("filterAllBooks")}</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title}
            </option>
          ))}
        </select>
      </div>

      <div className="notes-select">
        <select
          value={sortMode}
          onChange={(event) => onSortModeChange(event.target.value as NotesSortMode)}
          aria-label={t("sortLabel")}
        >
          <option value="recent">{t("sortRecent")}</option>
          <option value="oldest">{t("sortOldest")}</option>
        </select>
      </div>
    </div>
  );
}
