"use client";

import { useEffect, useRef } from "react";
import { saveShelfLayout, updateShelf } from "../api/shelves-client";
import { useShelfEditorStore } from "../store/shelf-editor-store";

const AUTOSAVE_DELAY_MS = 800;

/** Debounced "save everything currently in local state" — mount once per shelf editor. */
export function useAutosaveLayout() {
  const shelf = useShelfEditorStore((state) => state.shelf);
  const bookPositions = useShelfEditorStore((state) => state.bookPositions);
  const decorations = useShelfEditorStore((state) => state.decorations);
  const hasUnsavedChanges = useShelfEditorStore(
    (state) => state.hasUnsavedChanges,
  );
  const setSaveStatus = useShelfEditorStore((state) => state.setSaveStatus);
  const markSaved = useShelfEditorStore((state) => state.markSaved);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flush() {
    if (!shelf) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setSaveStatus("saving");
    const positions = Object.entries(bookPositions).map(
      ([bookId, position]) => ({ bookId, position }),
    );

    Promise.all([
      positions.length > 0
        ? saveShelfLayout(shelf.id, { positions })
        : Promise.resolve(undefined),
      updateShelf(shelf.id, { decorations }),
    ])
      .then(() => markSaved())
      .catch(() => setSaveStatus("error"));
  }

  useEffect(() => {
    if (!hasUnsavedChanges || !shelf) return;

    setSaveStatus("saving");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const shelfId = shelf.id;
    timeoutRef.current = setTimeout(() => {
      const positions = Object.entries(bookPositions).map(
        ([bookId, position]) => ({ bookId, position }),
      );

      Promise.all([
        positions.length > 0
          ? saveShelfLayout(shelfId, { positions })
          : Promise.resolve(undefined),
        updateShelf(shelfId, { decorations }),
      ])
        .then(() => markSaved())
        .catch(() => setSaveStatus("error"));
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [
    shelf,
    bookPositions,
    decorations,
    hasUnsavedChanges,
    setSaveStatus,
    markSaved,
  ]);

  return { saveNow: flush };
}
