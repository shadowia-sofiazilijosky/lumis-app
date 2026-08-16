"use client";

import { ReaderTheme } from "@lumis/shared-types";
import { useEffect, useRef } from "react";
import { fetchReadingProgress, saveReadingProgress } from "../api/reader-client";
import { useReaderStore } from "../store/reader-store";

const AUTOSAVE_DELAY_MS = 800;

/** Loads saved progress once on mount so the reader resumes exactly where the user left off. */
export function useLoadReadingProgress(bookId: string) {
  const loadProgress = useReaderStore((state) => state.loadProgress);

  useEffect(() => {
    let cancelled = false;

    fetchReadingProgress(bookId).then((progress) => {
      if (cancelled) return;
      loadProgress(bookId, {
        currentPage: progress?.currentPage ?? 1,
        currentLocator: progress?.currentLocator ?? null,
        progressPercent: progress?.progressPercent ?? 0,
        readerTheme: progress?.readerTheme ?? ReaderTheme.LIGHT,
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
      }).then(markSaved);
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [bookId, currentPage, locator, progressPercent, theme, hasUnsavedChanges, markSaved]);
}
