"use client";

import { useEffect } from "react";
import { fetchHighlights, fetchNotes } from "../api/annotations-client";
import { useAnnotationsStore } from "../store/annotations-store";

/** Loads existing highlights/notes once so they render as soon as a page is ready. */
export function useLoadAnnotations(bookId: string) {
  const loadAll = useAnnotationsStore((state) => state.loadAll);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchHighlights(bookId), fetchNotes(bookId)]).then(
      ([highlights, notes]) => {
        if (!cancelled) loadAll(highlights, notes);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [bookId, loadAll]);
}
