"use client";

import { BookOpenCheck, Feather, NotebookText } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface NotesStatsFooterProps {
  totalNotes: number;
  booksWithNotes: number;
  totalHighlights: number;
}

export function NotesStatsFooter({
  totalNotes,
  booksWithNotes,
  totalHighlights,
}: NotesStatsFooterProps) {
  const t = useTranslations("notesPage.stats");

  return (
    <div className="notes-stats-footer">
      <div className="notes-stats-items">
        <div className="notes-stat-item">
          <NotebookText size={22} className="notes-stat-icon" />
          <div>
            <p className="notes-stat-label">{t("totalNotes")}</p>
            <p className="notes-stat-value">{totalNotes}</p>
          </div>
        </div>

        <div className="notes-stat-item">
          <BookOpenCheck size={22} className="notes-stat-icon" />
          <div>
            <p className="notes-stat-label">{t("booksWithNotes")}</p>
            <p className="notes-stat-value">{booksWithNotes}</p>
          </div>
        </div>

        <div className="notes-stat-item">
          <Feather size={22} className="notes-stat-icon" />
          <div>
            <p className="notes-stat-label">{t("highlights")}</p>
            <p className="notes-stat-value">{totalHighlights}</p>
          </div>
        </div>
      </div>

      <Image
        src="/assets/illustrations/notas-footer-vela-libros.png"
        alt=""
        width={272}
        height={102}
        className="notes-stats-illustration"
      />
    </div>
  );
}
