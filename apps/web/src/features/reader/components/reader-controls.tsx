"use client";

import { ReaderTheme } from "@lumis/shared-types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { READER_THEME_LABELS } from "../api/reader-client";
import { useAutoHideControls } from "../hooks/use-auto-hide-controls";
import { useTapToToggleControls } from "../hooks/use-tap-to-toggle-controls";
import { useReaderStore } from "../store/reader-store";

interface ReaderControlsProps {
  bookId: string;
  title: string;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  pageLabel: string;
  /** PDF/EPUB/TXT: text must stay selectable, so an opaque tap-zone overlay can't be used here. */
  textSelectable: boolean;
}

const THEME_ORDER: ReaderTheme[] = [
  ReaderTheme.LIGHT,
  ReaderTheme.DARK,
  ReaderTheme.SEPIA,
];

export function ReaderControls({
  bookId,
  title,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
  pageLabel,
  textSelectable,
}: ReaderControlsProps) {
  useAutoHideControls();
  useTapToToggleControls(textSelectable);

  const controlsVisible = useReaderStore((state) => state.controlsVisible);
  const theme = useReaderStore((state) => state.theme);
  const setTheme = useReaderStore((state) => state.setTheme);
  const toggleControls = useReaderStore((state) => state.toggleControls);

  return (
    <>
      {!textSelectable && (
        <div
          className="reader-tap-zones"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="reader-tap-zone reader-tap-zone-prev"
            aria-label="Página anterior"
            onClick={onPrev}
            disabled={!canGoPrev}
          />
          <button
            type="button"
            className="reader-tap-zone reader-tap-zone-center"
            aria-label="Mostrar u ocultar controles"
            onClick={toggleControls}
          />
          <button
            type="button"
            className="reader-tap-zone reader-tap-zone-next"
            aria-label="Página siguiente"
            onClick={onNext}
            disabled={!canGoNext}
          />
        </div>
      )}

      <header
        className={`reader-topbar ${controlsVisible ? "reader-controls-visible" : ""}`}
      >
        <Link href={`/library/${bookId}`} className="reader-close">
          <ChevronLeft size={16} /> Volver
        </Link>
        <h1 className="reader-title">{title}</h1>
        <div className="reader-theme-switch">
          {THEME_ORDER.map((option) => (
            <button
              key={option}
              type="button"
              className={option === theme ? "reader-theme-active" : "secondary"}
              onClick={() => setTheme(option)}
            >
              {READER_THEME_LABELS[option]}
            </button>
          ))}
        </div>
      </header>

      <footer
        className={`reader-bottombar ${controlsVisible ? "reader-controls-visible" : ""}`}
      >
        <button type="button" onClick={onPrev} disabled={!canGoPrev}>
          <ChevronLeft size={16} /> Anterior
        </button>
        <span className="reader-page-label">{pageLabel}</span>
        <button type="button" onClick={onNext} disabled={!canGoNext}>
          Siguiente <ChevronRight size={16} />
        </button>
      </footer>
    </>
  );
}
