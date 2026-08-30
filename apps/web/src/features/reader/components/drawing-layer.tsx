"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { createHighlight, createStroke } from "../api/annotations-client";
import { renderStroke } from "../lib/brush-renderer";
import { getBrush } from "../lib/brushes";
import {
  getOffsetsFromRange,
  isPlausibleDragSelection,
  rangeFromStrokePoints,
} from "../lib/text-range";
import { useAnnotationsStore } from "../store/annotations-store";

interface DrawingLayerProps {
  bookId: string;
  pageIndex: number;
  containerRef: RefObject<HTMLElement | null>;
  /** The text-bearing element (PDF text layer, TXT page) to check a stroke
   * against before committing it as ink — defaults to `containerRef` for
   * formats where the drawing surface and the text share one element. */
  textContainerRef?: RefObject<HTMLElement | null>;
  /** Bump whenever the page's own size may have changed (zoom, page turn). */
  refreshKey: string | number;
}

/** Highlight.size buckets from the pen's numeric thickness (2-48px, see
 * drawing-tool-panel.tsx) — same idea as the reader's existing thin/normal/
 * thick highlight marks, just derived instead of separately chosen. */
function sizeBucket(px: number): string {
  if (px < 10) return "thin";
  if (px > 24) return "thick";
  return "normal";
}

function toPixels(
  points: [number, number][],
  size: { width: number; height: number },
): [number, number][] {
  return points.map(([x, y]) => [x * size.width, y * size.height]);
}

/** Freehand brush drawing, independent of text -- a canvas the same size as
 * the page. Every redraw replays all of the page's committed strokes in
 * order (that's also how the eraser works: a real destination-out punch,
 * order-dependent like a raster eraser). Points are stored normalized 0-1
 * against the page size so strokes re-scale correctly at any zoom level. */
export function DrawingLayer({
  bookId,
  pageIndex,
  containerRef,
  textContainerRef,
  refreshKey,
}: DrawingLayerProps) {
  const strokes = useAnnotationsStore((state) => state.strokes);
  const addStroke = useAnnotationsStore((state) => state.addStroke);
  const addHighlight = useAnnotationsStore((state) => state.addHighlight);
  const drawTool = useAnnotationsStore((state) => state.drawTool);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [liveNormalizedPoints, setLiveNormalizedPoints] = useState<[number, number][] | null>(
    null,
  );
  const drawing = useRef(false);
  // Real screen coordinates of the stroke's start/end -- separate from the
  // normalized points above (which are relative to the drawing canvas and
  // used for the stroke's own rendering/persistence), needed to ask the DOM
  // what text, if any, sits under this stroke.
  const clientStart = useRef<{ x: number; y: number } | null>(null);
  const clientEnd = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });
  }, [containerRef, refreshKey]);

  const pageStrokes = useMemo(
    () => strokes.filter((s) => s.pageIndex === pageIndex),
    [strokes, pageIndex],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0 || size.height === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);

    for (const stroke of pageStrokes) {
      renderStroke(ctx, toPixels(stroke.points, size), getBrush(stroke.brush), stroke.color, stroke.size);
    }

    if (liveNormalizedPoints && drawTool) {
      renderStroke(
        ctx,
        toPixels(liveNormalizedPoints, size),
        getBrush(drawTool.brush),
        drawTool.color,
        drawTool.size,
      );
    }
  }, [pageStrokes, size, liveNormalizedPoints, drawTool]);

  function toNormalized(clientX: number, clientY: number): [number, number] | null {
    const container = containerRef.current;
    if (!container || size.width === 0 || size.height === 0) return null;
    const rect = container.getBoundingClientRect();
    return [(clientX - rect.left) / rect.width, (clientY - rect.top) / rect.height];
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawTool) return;
    const point = toNormalized(event.clientX, event.clientY);
    if (!point) return;
    drawing.current = true;
    canvasRef.current?.setPointerCapture(event.pointerId);
    setLiveNormalizedPoints([point]);
    clientStart.current = { x: event.clientX, y: event.clientY };
    clientEnd.current = clientStart.current;
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const point = toNormalized(event.clientX, event.clientY);
    if (!point) return;
    setLiveNormalizedPoints((prev) => (prev ? [...prev, point] : [point]));
    clientEnd.current = { x: event.clientX, y: event.clientY };
  }

  /** If the pen was dragged over real text, save it as a proper anchored
   * Highlight (the pen's color/thickness) instead of a freehand Stroke, so
   * it renders as an actual highlighter bar and counts correctly on the
   * Notas page. Returns false wherever there's no text under the stroke (a
   * margin, an image-only page, the eraser) -- the caller then falls back
   * to the plain ink mark, same as before this existed. */
  async function tryCreateHighlight(): Promise<boolean> {
    if (!drawTool || drawTool.brush === "eraser") return false;
    if (!clientStart.current || !clientEnd.current) return false;

    const range = rangeFromStrokePoints(clientStart.current, clientEnd.current);
    if (!range) return false;

    const container = (textContainerRef ?? containerRef).current;
    if (!container || !container.contains(range.commonAncestorContainer)) return false;
    if (!isPlausibleDragSelection(range, clientStart.current.y, clientEnd.current.y)) {
      return false;
    }

    const { start, end, text } = getOffsetsFromRange(container, range);
    if (!text.trim()) return false;

    const highlight = await createHighlight(bookId, {
      pageIndex,
      startOffset: start,
      endOffset: end,
      selectedText: text,
      color: drawTool.color,
      size: sizeBucket(drawTool.size),
    });
    if (!highlight) return false;

    addHighlight(highlight);
    return true;
  }

  async function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !drawTool) return;
    drawing.current = false;
    canvasRef.current?.releasePointerCapture(event.pointerId);

    const points = liveNormalizedPoints;
    setLiveNormalizedPoints(null);
    if (!points || points.length < 2) return;

    if (await tryCreateHighlight()) return;

    const stroke = await createStroke(bookId, {
      pageIndex,
      points,
      color: drawTool.color,
      brush: drawTool.brush,
      size: drawTool.size,
    });
    if (stroke) addStroke(stroke);
  }

  return (
    <canvas
      ref={canvasRef}
      className={`drawing-layer${drawTool ? " drawing-layer-active" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
}
