"use client";

import { useTranslations } from "next-intl";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { deleteHighlight } from "../api/annotations-client";
import {
  getOffsetsFromRange,
  isPlausibleDragSelection,
  rangeFromOffsets,
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

// CSS Custom Highlight API -- not in every TS lib target yet. When present,
// it paints a stored Range natively (like the selection highlight), so the
// mark follows the text through any zoom, reflow or page-turn transform
// with zero coordinate math. Falls back to the absolute-overlay rects
// otherwise.
interface HighlightRegistryLike {
  set(name: string, highlight: object): void;
  delete(name: string): void;
}
function getHighlightApi(): {
  registry: HighlightRegistryLike;
  Ctor: new (...ranges: Range[]) => object;
} | null {
  if (typeof CSS === "undefined") return null;
  const registry = (CSS as unknown as { highlights?: HighlightRegistryLike }).highlights;
  const Ctor = (globalThis as unknown as { Highlight?: new (...ranges: Range[]) => object })
    .Highlight;
  if (!registry || !Ctor) return null;
  return { registry, Ctor };
}

/**
 * Selection capture + highlight/note overlay for text-based pages (PDF text
 * layer, TXT). Renders nothing of its own text — it reads `containerRef`'s
 * already-visible text and either paints highlights natively (CSS Custom
 * Highlight API) or draws absolutely-positioned marks over it.
 */
export function TextAnnotationLayer({
  bookId,
  pageIndex,
  containerRef,
  refreshKey,
}: TextAnnotationLayerProps) {
  const t = useTranslations("reader");
  const highlights = useAnnotationsStore((state) => state.highlights);
  const notes = useAnnotationsStore((state) => state.notes);
  const removeHighlightLocal = useAnnotationsStore(
    (state) => state.removeHighlightLocal,
  );
  const setPendingSelection = useAnnotationsStore(
    (state) => state.setPendingSelection,
  );
  const openExistingNote = useAnnotationsStore((state) => state.openExistingNote);

  const dragStartY = useRef(0);

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      dragStartY.current = event.clientY;
    }

    function handleMouseUp(event: MouseEvent) {
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
  const [nativeHighlightCss, setNativeHighlightCss] = useState("");

  // Highlights: native CSS Custom Highlight API when available (perfect at
  // any zoom / page-turn transform), otherwise the absolute-overlay rects.
  // Note pins always use the overlay (they're a single anchor point, far
  // less sensitive to layout, and need to be clickable to open the note).
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      setHighlightMarks([]);
      setNotePins([]);
      setNativeHighlightCss("");
      return;
    }

    const api = getHighlightApi();

    if (api) {
      // One registered highlight per distinct color (the API styles a whole
      // named highlight at once, not per range). Names are scoped by page
      // so the two pages of a spread view don't clash in the global registry.
      const byColor = new Map<string, Range[]>();
      for (const highlight of pageHighlights) {
        const range = rangeFromOffsets(
          container,
          highlight.startOffset,
          highlight.endOffset,
        );
        if (!range) continue;
        const list = byColor.get(highlight.color) ?? [];
        list.push(range);
        byColor.set(highlight.color, list);
      }

      const names: string[] = [];
      let css = "";
      let index = 0;
      for (const [color, ranges] of byColor) {
        const name = `lumis-hl-${pageIndex}-${index++}`;
        api.registry.set(name, new api.Ctor(...ranges));
        names.push(name);
        css += `::highlight(${name}){background-color:${color};border-radius:2px;}`;
      }

      setNativeHighlightCss(css);
      setHighlightMarks([]);

      setNotePins(
        pageNotes
          .map((note) => {
            const rects = rectsForOffsets(container, note.offset, note.offset + 1);
            return rects[0] ? { id: note.id, rect: rects[0] } : null;
          })
          .filter((pin): pin is NotePin => pin !== null),
      );

      return () => {
        for (const name of names) api.registry.delete(name);
      };
    }

    // ---- Fallback: absolute overlay rects (older browsers) ----
    setNativeHighlightCss("");
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
    if (!window.confirm(t("removeHighlightConfirm"))) return;
    removeHighlightLocal(id);
    await deleteHighlight(bookId, id);
  }

  return (
    <div className="annotation-overlay">
      {nativeHighlightCss ? <style>{nativeHighlightCss}</style> : null}
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
            title={t("removeHighlight")}
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
          aria-label={t("viewNote")}
          onClick={(event) =>
            openExistingNote(id, event.currentTarget.getBoundingClientRect())
          }
        />
      ))}
    </div>
  );
}
