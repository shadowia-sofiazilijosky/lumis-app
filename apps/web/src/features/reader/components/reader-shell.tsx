"use client";

import { BookFormat, type BookDetail } from "@lumis/shared-types";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("reader");
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
  const toggleControls = useReaderStore((state) => state.toggleControls);
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
  // In "flip" mode EPUB is paginated into fixed leaves (EpubFlipReader) and
  // navigated by page number like every other format, instead of through
  // epub.js's own CFI-based next/prev on its (unmounted, in this mode) rendition.
  const epubUsesFlipPaging = isEpub && pageTurnMode === "flip";

  function handlePrev() {
    if (isEpub && !epubUsesFlipPaging) {
      epubRef.current?.prev();
      return;
    }
    goToPage(Math.max(1, currentPage - 1));
  }

  function handleNext() {
    if (isEpub && !epubUsesFlipPaging) {
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
    return <p>{t("loading")}</p>;
  }

  if (status === "error" || !book) {
    return <p>{t("loadError")}</p>;
  }

  if (book.format === BookFormat.MOBI) {
    return <p>{t("mobiUnsupported")}</p>;
  }

  if (!book.fileUrl && (book.format === BookFormat.PDF || book.format === BookFormat.EPUB)) {
    return <p>{t("noReadLink")}</p>;
  }

  const currentBook = book;
  const fileUrl = currentBook.fileUrl;

  const canGoPrev = isEpub && !epubUsesFlipPaging ? true : currentPage > 1;
  const canGoNext =
    isEpub && !epubUsesFlipPaging ? true : totalPages === null || currentPage < totalPages;
  const pageLabel =
    isEpub && !epubUsesFlipPaging
      ? `${progressPercent}%`
      : totalPages
        ? t("pageLabelTotal", { current: currentPage, total: totalPages })
        : t("pageLabel", { current: currentPage });
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
        // A plain click landing directly on the empty background (not on a
        // page, canvas, or any of its children) toggles the menu -- the
        // reliable version of "tap outside the page" the band-based
        // useTapToToggleControls heuristic doesn't always catch.
        onClick={(event) => {
          if (event.target === event.currentTarget) toggleControls();
        }}
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
