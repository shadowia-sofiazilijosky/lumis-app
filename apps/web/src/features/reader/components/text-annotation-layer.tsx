"use client";

import type { HighlightColor } from "@lumis/shared-types";
import { useEffect, useLayoutEffect, useMemo, useState, type RefObject } from "react";
import { deleteHighlight } from "../api/annotations-client";
import { getOffsetsFromRange, rectsForOffsets } from "../lib/text-range";
import { useAnnotationsStore } from "../store/annotations-store";

interface TextAnnotationLayerProps {
  bookId: string;
  pageIndex: number;
  containerRef: RefObject<HTMLElement | null>;
  /** Bump whenever the underlying text content is re-rendered, so overlay rects are recomputed. */
  refreshKey: string | number;
}

interface HighlightMark {
  key: string;
  id: string;
  color: HighlightColor;
  rect: DOMRect;
}

interface NotePin {
  id: string;
  rect: DOMRect;
}

/**
 * Selection capture + highlight/note overlay for text-based pages (PDF text
 * layer, TXT). Renders nothing of its own text — it reads `containerRef`'s
 * already-visible text and draws absolutely-positioned marks over it.
 */
export function TextAnnotationLayer({
  bookId,
  pageIndex,
  containerRef,
  refreshKey,
}: TextAnnotationLayerProps) {
  const highlights = useAnnotationsStore((state) => state.highlights);
  const notes = useAnnotationsStore((state) => state.notes);
  const removeHighlightLocal = useAnnotationsStore(
    (state) => state.removeHighlightLocal,
  );
  const setPendingSelection = useAnnotationsStore(
    (state) => state.setPendingSelection,
  );
  const openExistingNote = useAnnotationsStore((state) => state.openExistingNote);

  useEffect(() => {
    function handleMouseUp() {
      const container = containerRef.current;
      const selection = window.getSelection();
      if (!container || !selection || selection.isCollapsed || selection.rangeCount === 0) {
        return;
      }

      const range = selection.getRangeAt(0);
      if (!container.contains(range.commonAncestorContainer)) return;

      const { start, end, text } = getOffsetsFromRange(container, range);
      if (!text.trim()) return;

      setPendingSelection({
        pageIndex,
        startOffset: start,
        endOffset: end,
        text,
        rect: range.getBoundingClientRect(),
      });
    }

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [containerRef, pageIndex, setPendingSelection]);

  const pageHighlights = useMemo(
    () => highlights.filter((h) => h.pageIndex === pageIndex && !h.cfi),
    [highlights, pageIndex],
  );
  const pageNotes = useMemo(
    () => notes.filter((n) => n.pageIndex === pageIndex && !n.cfi),
    [notes, pageIndex],
  );

  const [highlightMarks, setHighlightMarks] = useState<HighlightMark[]>([]);
  const [notePins, setNotePins] = useState<NotePin[]>([]);

  // Overlay rects come from DOM layout (Range.getClientRects()), which can
  // only be read after commit — this is exactly the "read layout, then
  // setState before paint" case useLayoutEffect exists for, not something
  // derivable during render.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      setHighlightMarks([]);
      setNotePins([]);
      return;
    }

    setHighlightMarks(
      pageHighlights.flatMap((highlight) =>
        rectsForOffsets(container, highlight.startOffset, highlight.endOffset).map(
          (rect, index) => ({
            key: `${highlight.id}-${index}`,
            id: highlight.id,
            color: highlight.color,
            rect,
          }),
        ),
      ),
    );

    setNotePins(
      pageNotes
        .map((note) => {
          const rects = rectsForOffsets(container, note.offset, note.offset + 1);
          return rects[0] ? { id: note.id, rect: rects[0] } : null;
        })
        .filter((pin): pin is NotePin => pin !== null),
    );
  }, [containerRef, pageHighlights, pageNotes, refreshKey]);

  async function handleDeleteHighlight(id: string) {
    if (!window.confirm("¿Quitar este resaltado?")) return;
    removeHighlightLocal(id);
    await deleteHighlight(bookId, id);
  }

  return (
    <div className="annotation-overlay">
      {highlightMarks.map(({ key, id, color, rect }) => (
        <button
          key={key}
          type="button"
          className={`highlight-mark highlight-${color.toLowerCase()}`}
          style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
          title="Quitar resaltado"
          onClick={() => handleDeleteHighlight(id)}
        />
      ))}
      {notePins.map(({ id, rect }) => (
        <button
          key={id}
          type="button"
          className="note-pin"
          style={{ left: rect.x + rect.width, top: rect.y }}
          aria-label="Ver nota"
          onClick={(event) =>
            openExistingNote(id, event.currentTarget.getBoundingClientRect())
          }
        />
      ))}
    </div>
  );
}
