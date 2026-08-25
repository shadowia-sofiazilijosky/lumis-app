"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { createHighlight, deleteHighlight } from "../api/annotations-client";
import {
  getOffsetsFromRange,
  isPlausibleDragSelection,
  rectsForOffsets,
} from "../lib/text-range";
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
  color: string;
  size: string;
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
  const addHighlight = useAnnotationsStore((state) => state.addHighlight);
  const activePen = useAnnotationsStore((state) => state.activePen);
  const setPendingSelection = useAnnotationsStore(
    (state) => state.setPendingSelection,
  );
  const openExistingNote = useAnnotationsStore((state) => state.openExistingNote);

  // Read via a ref inside the mouseup handler so the pen's current
  // color/size are always fresh without re-subscribing the mousedown/mouseup
  // listeners (which must stay stable across renders — they're on `document`).
  const activePenRef = useRef(activePen);
  useEffect(() => {
    activePenRef.current = activePen;
  }, [activePen]);

  const dragStartY = useRef(0);

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      dragStartY.current = event.clientY;
    }

    async function handleMouseUp(event: MouseEvent) {
      const container = containerRef.current;
      const selection = window.getSelection();
      if (!container || !selection || selection.isCollapsed || selection.rangeCount === 0) {
        return;
      }

      const range = selection.getRangeAt(0);
      if (!container.contains(range.commonAncestorContainer)) return;
      if (!isPlausibleDragSelection(range, dragStartY.current, event.clientY)) {
        selection.removeAllRanges();
        return;
      }

      const { start, end, text } = getOffsetsFromRange(container, range);
      if (!text.trim()) return;

      const pen = activePenRef.current;
      if (pen) {
        // Pen already chosen — paint immediately, no color prompt.
        selection.removeAllRanges();
        const highlight = await createHighlight(bookId, {
          color: pen.color,
          size: pen.size,
          pageIndex,
          startOffset: start,
          endOffset: end,
          selectedText: text,
        });
        if (highlight) addHighlight(highlight);
        return;
      }

      setPendingSelection({
        pageIndex,
        startOffset: start,
        endOffset: end,
        text,
        rect: range.getBoundingClientRect(),
      });
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [addHighlight, bookId, containerRef, pageIndex, setPendingSelection]);

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
            size: highlight.size,
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
      {highlightMarks.map(({ key, id, color, size, rect }) => {
        // "Fino" reads as an underline under the text; "grueso" pads the
        // block above/below; "normal" is the plain text-height rectangle.
        const style =
          size === "thin"
            ? {
                left: rect.x,
                top: rect.y + rect.height - 4,
                width: rect.width,
                height: 4,
              }
            : size === "thick"
              ? {
                  left: rect.x,
                  top: rect.y - 3,
                  width: rect.width,
                  height: rect.height + 6,
                }
              : { left: rect.x, top: rect.y, width: rect.width, height: rect.height };

        return (
          <button
            key={key}
            type="button"
            className="highlight-mark"
            style={{ ...style, background: color }}
            title="Quitar resaltado"
            onClick={() => handleDeleteHighlight(id)}
          />
        );
      })}
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
