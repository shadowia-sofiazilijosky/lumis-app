"use client";

import { ReaderTheme } from "@lumis/shared-types";
import { useEffect, useRef } from "react";
import { fetchReadingProgress, saveReadingProgress } from "../api/reader-client";
import { useReaderStore, type PageOrientation, type PageTurnMode } from "../store/reader-store";

const AUTOSAVE_DELAY_MS = 800;

/** Loads saved progress once on mount so the reader resumes exactly where the user left off. */
export function useLoadReadingProgress(bookId: string) {
  const loadProgress = useReaderStore((state) => state.loadProgress);

  useEffect(() => {
    let cancelled = false;

    fetchReadingProgress(bookId).then((progress) => {
      if (cancelled) return;
      const currentPage = progress?.currentPage ?? 1;
      const currentLocator = progress?.currentLocator ?? null;
      const progressPercent = progress?.progressPercent ?? 0;
      const readerTheme = progress?.readerTheme ?? ReaderTheme.LIGHT;
      const pageTurnMode = (progress?.pageTurnMode ?? "flip") as PageTurnMode;
      const readingRulerEnabled = progress?.readingRulerEnabled ?? false;
      const pageOrientation = (progress?.pageOrientation ?? "portrait") as PageOrientation;

      loadProgress(bookId, {
        currentPage,
        currentLocator,
        progressPercent,
        readerTheme,
        pageTurnMode,
        readingRulerEnabled,
        pageOrientation,
      });

      // Re-save the just-loaded (unchanged) values so simply opening a book
      // counts as today's reading activity -- otherwise a session that
      // never turns a page (or turns back to the same page) never triggers
      // the autosave below, and the streak silently misses that day.
      saveReadingProgress(bookId, {
        currentPage,
        currentLocator,
        progressPercent,
        readerTheme,
        pageTurnMode,
        readingRulerEnabled,
        pageOrientation,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [bookId, loadProgress]);
}

/** Debounced autosave of the current page/locator/theme — mount once per reader session. */
export function useAutosaveReadingProgress(bookId: string) {
  const currentPage = useReaderStore((state) => state.currentPage);
  const locator = useReaderStore((state) => state.locator);
  const progressPercent = useReaderStore((state) => state.progressPercent);
  const theme = useReaderStore((state) => state.theme);
  const pageTurnMode = useReaderStore((state) => state.pageTurnMode);
  const readingRulerEnabled = useReaderStore((state) => state.readingRulerEnabled);
  const pageOrientation = useReaderStore((state) => state.pageOrientation);
  const hasUnsavedChanges = useReaderStore((state) => state.hasUnsavedChanges);
  const markSaved = useReaderStore((state) => state.markSaved);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      saveReadingProgress(bookId, {
        currentPage,
        currentLocator: locator,
        progressPercent,
        readerTheme: theme,
        pageTurnMode,
        readingRulerEnabled,
        pageOrientation,
      }).then(markSaved);
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [
    bookId,
    currentPage,
    locator,
    progressPercent,
    theme,
    pageTurnMode,
    readingRulerEnabled,
    pageOrientation,
    hasUnsavedChanges,
    markSaved,
  ]);
}
