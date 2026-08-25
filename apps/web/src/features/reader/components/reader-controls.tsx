"use client";

import { ReaderTheme } from "@lumis/shared-types";
import {
  ArrowLeftRight,
  ArrowUpDown,
  BookOpen,
  Brush,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { READER_THEME_LABELS } from "../api/reader-client";
import { useAutoHideControls } from "../hooks/use-auto-hide-controls";
import { useTapToToggleControls } from "../hooks/use-tap-to-toggle-controls";
import { useAnnotationsStore } from "../store/annotations-store";
import { useReaderStore, type PageTurnMode } from "../store/reader-store";

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
  /** PDF/TXT only — whether the freehand brush tool applies to this format. */
  highlighterSupported: boolean;
}

const THEME_ORDER: ReaderTheme[] = [
  ReaderTheme.LIGHT,
  ReaderTheme.DARK,
  ReaderTheme.SEPIA,
];

const PAGE_TURN_MODES: { mode: PageTurnMode; label: string; Icon: typeof ArrowLeftRight }[] = [
  { mode: "horizontal", label: "Horizontal", Icon: ArrowLeftRight },
  { mode: "vertical", label: "Vertical", Icon: ArrowUpDown },
  { mode: "flip", label: "Libro real", Icon: BookOpen },
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
  highlighterSupported,
}: ReaderControlsProps) {
  useAutoHideControls();
  useTapToToggleControls(textSelectable);

  const drawTool = useAnnotationsStore((state) => state.drawTool);
  const drawToolPickerOpen = useAnnotationsStore((state) => state.drawToolPickerOpen);
  const setDrawToolPickerOpen = useAnnotationsStore(
    (state) => state.setDrawToolPickerOpen,
  );

  const controlsVisible = useReaderStore((state) => state.controlsVisible);
  const theme = useReaderStore((state) => state.theme);
  const setTheme = useReaderStore((state) => state.setTheme);
  const toggleControls = useReaderStore((state) => state.toggleControls);
  const zoom = useReaderStore((state) => state.zoom);
  const zoomIn = useReaderStore((state) => state.zoomIn);
  const zoomOut = useReaderStore((state) => state.zoomOut);
  const resetZoom = useReaderStore((state) => state.resetZoom);
  const pageTurnMode = useReaderStore((state) => state.pageTurnMode);
  const setPageTurnMode = useReaderStore((state) => state.setPageTurnMode);

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
        <div className="reader-toolbar-group">
          <div className="reader-page-turn-switch">
            {PAGE_TURN_MODES.map(({ mode, label, Icon }) => (
              <button
                key={mode}
                type="button"
                className={mode === pageTurnMode ? "reader-theme-active" : "secondary"}
                aria-label={`Modo de paso de página: ${label}`}
                aria-pressed={mode === pageTurnMode}
                onClick={() => setPageTurnMode(mode)}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>

          {highlighterSupported && (
            <button
              type="button"
              className={`reader-pen-toggle${drawTool ? " reader-pen-toggle-active" : ""}`}
              aria-pressed={drawToolPickerOpen}
              aria-label="Pincel"
              onClick={() => setDrawToolPickerOpen(!drawToolPickerOpen)}
            >
              <Brush size={15} />
              {drawTool && <span className="reader-pen-swatch" style={{ background: drawTool.color }} />}
            </button>
          )}

          <div className="reader-zoom-controls">
            <button type="button" aria-label="Alejar" onClick={zoomOut}>
              <Minus size={14} />
            </button>
            <button
              type="button"
              className="reader-zoom-label"
              onClick={resetZoom}
              aria-label="Restablecer zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button type="button" aria-label="Acercar" onClick={zoomIn}>
              <Plus size={14} />
            </button>
          </div>

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
