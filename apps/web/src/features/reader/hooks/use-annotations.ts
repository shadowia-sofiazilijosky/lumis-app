"use client";

import { useEffect } from "react";
import { fetchHighlights, fetchNotes, fetchStrokes } from "../api/annotations-client";
import { useAnnotationsStore } from "../store/annotations-store";

/** Loads existing highlights/notes/strokes once so they render as soon as a page is ready. */
export function useLoadAnnotations(bookId: string) {
  const loadAll = useAnnotationsStore((state) => state.loadAll);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchHighlights(bookId), fetchNotes(bookId), fetchStrokes(bookId)]).then(
      ([highlights, notes, strokes]) => {
        if (!cancelled) loadAll(highlights, notes, strokes);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [bookId, loadAll]);
}
