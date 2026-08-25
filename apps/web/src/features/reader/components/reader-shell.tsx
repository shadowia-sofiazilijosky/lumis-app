"use client";

import { BookFormat, type BookDetail } from "@lumis/shared-types";
import { useEffect, useRef, useState } from "react";
import { fetchBookDetail } from "@/features/books/api/books-client";
import { useKeyboardNavigation } from "../hooks/use-keyboard-navigation";
import { useLoadAnnotations } from "../hooks/use-annotations";
import { useReaderGestures } from "../hooks/use-reader-gestures";
import {
  useAutosaveReadingProgress,
  useLoadReadingProgress,
} from "../hooks/use-reading-progress";
import { useAnnotationsStore } from "../store/annotations-store";
import { useReaderStore } from "../store/reader-store";
import { DrawingToolPanel } from "./drawing-tool-panel";
import { EpubReader, type EpubReaderHandle } from "./epub-reader";
import { NotePopover } from "./note-popover";
import { PaginatedReader } from "./paginated-reader";
import { PdfReader } from "./pdf-reader";
import { PenCursor } from "./pen-cursor";
import { ReaderControls } from "./reader-controls";
import { SelectionToolbar } from "./selection-toolbar";

export function ReaderShell({ bookId }: { bookId: string }) {
  const [book, setBook] = useState<BookDetail | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const epubRef = useRef<EpubReaderHandle>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useLoadReadingProgress(bookId);
  useAutosaveReadingProgress(bookId);
  useLoadAnnotations(bookId);

  const theme = useReaderStore((state) => state.theme);
  const currentPage = useReaderStore((state) => state.currentPage);
  const totalPages = useReaderStore((state) => state.totalPages);
  const locator = useReaderStore((state) => state.locator);
  const progressPercent = useReaderStore((state) => state.progressPercent);
  const goToPage = useReaderStore((state) => state.goToPage);
  const setTotalPages = useReaderStore((state) => state.setTotalPages);
  const zoom = useReaderStore((state) => state.zoom);
  const setZoom = useReaderStore((state) => state.setZoom);
  const pageTurnMode = useReaderStore((state) => state.pageTurnMode);
  const openNoteId = useAnnotationsStore((state) => state.openNoteId);
  const drawTool = useAnnotationsStore((state) => state.drawTool);
  const drawToolPickerOpen = useAnnotationsStore((state) => state.drawToolPickerOpen);

  useEffect(() => {
    let cancelled = false;

    fetchBookDetail(bookId)
      .then((data) => {
        if (cancelled) return;
        setBook(data);
        if (data.pageCount && data.format !== BookFormat.EPUB) {
          setTotalPages(data.pageCount);
        }
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [bookId, setTotalPages]);

  const isEpub = book?.format === BookFormat.EPUB;

  function handlePrev() {
    if (isEpub) {
      epubRef.current?.prev();
      return;
    }
    goToPage(Math.max(1, currentPage - 1));
  }

  function handleNext() {
    if (isEpub) {
      epubRef.current?.next();
      return;
    }
    goToPage(Math.min(totalPages ?? currentPage + 1, currentPage + 1));
  }

  useKeyboardNavigation(handlePrev, handleNext, {
    mode: pageTurnMode,
    scrollContainerRef: viewportRef,
  });
  useReaderGestures(viewportRef, {
    onPrev: handlePrev,
    onNext: handleNext,
    mode: pageTurnMode,
    zoom,
    setZoom,
  });

  if (status === "loading") {
    return <p>Cargando…</p>;
  }

  if (status === "error" || !book) {
    return <p>No pudimos cargar este libro.</p>;
  }

  if (book.format === BookFormat.MOBI) {
    return <p>La lectura de archivos MOBI todavía no está soportada.</p>;
  }

  if (!book.fileUrl && (book.format === BookFormat.PDF || book.format === BookFormat.EPUB)) {
    return <p>No pudimos generar el enlace de lectura para este libro.</p>;
  }

  const currentBook = book;
  const fileUrl = currentBook.fileUrl;

  const canGoPrev = isEpub ? true : currentPage > 1;
  const canGoNext = isEpub ? true : totalPages === null || currentPage < totalPages;
  const pageLabel = isEpub
    ? `${progressPercent}%`
    : `Página ${currentPage}${totalPages ? ` / ${totalPages}` : ""}`;
  const textSelectable =
    currentBook.format === BookFormat.PDF ||
    currentBook.format === BookFormat.EPUB ||
    currentBook.format === BookFormat.TXT;
  // The brush paints onto a per-page pixel overlay sized to a fixed page
  // frame, which only PDF and TXT render — EPUB's reflowable content has no
  // such fixed frame to anchor strokes to.
  const highlighterSupported =
    currentBook.format === BookFormat.PDF || currentBook.format === BookFormat.TXT;

  return (
    <div className={`reader-shell reader-theme-${theme.toLowerCase()}`}>
      <ReaderControls
        bookId={bookId}
        title={currentBook.title}
        onPrev={handlePrev}
        onNext={handleNext}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        pageLabel={pageLabel}
        textSelectable={textSelectable}
        highlighterSupported={highlighterSupported}
      />

      <div
        ref={viewportRef}
        className={`reader-viewport${drawTool ? " pen-active" : ""}`}
      >
        {currentBook.format === BookFormat.PDF && fileUrl && (
          <PdfReader bookId={bookId} fileUrl={fileUrl} />
        )}
        {isEpub && fileUrl && (
          <EpubReader
            ref={epubRef}
            bookId={bookId}
            fileUrl={fileUrl}
            initialLocator={locator}
            zoom={zoom}
          />
        )}
        {(currentBook.format === BookFormat.CBR ||
          currentBook.format === BookFormat.CBZ ||
          currentBook.format === BookFormat.TXT) && (
          <PaginatedReader
            bookId={bookId}
            format={currentBook.format}
            zoom={zoom}
          />
        )}
      </div>

      {drawTool && <PenCursor containerRef={viewportRef} tool={drawTool} />}

      <SelectionToolbar />
      {drawToolPickerOpen && <DrawingToolPanel />}
      <NotePopover key={openNoteId ?? "closed"} bookId={bookId} />
    </div>
  );
}
