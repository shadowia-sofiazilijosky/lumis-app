"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { createStroke } from "../api/annotations-client";
import { renderStroke } from "../lib/brush-renderer";
import { getBrush } from "../lib/brushes";
import { useAnnotationsStore } from "../store/annotations-store";

interface DrawingLayerProps {
  bookId: string;
  pageIndex: number;
  containerRef: RefObject<HTMLElement | null>;
  /** Bump whenever the page's own size may have changed (zoom, page turn). */
  refreshKey: string | number;
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
export function DrawingLayer({ bookId, pageIndex, containerRef, refreshKey }: DrawingLayerProps) {
  const strokes = useAnnotationsStore((state) => state.strokes);
  const addStroke = useAnnotationsStore((state) => state.addStroke);
  const drawTool = useAnnotationsStore((state) => state.drawTool);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [liveNormalizedPoints, setLiveNormalizedPoints] = useState<[number, number][] | null>(
    null,
  );
  const drawing = useRef(false);

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
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const point = toNormalized(event.clientX, event.clientY);
    if (!point) return;
    setLiveNormalizedPoints((prev) => (prev ? [...prev, point] : [point]));
  }

  async function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !drawTool) return;
    drawing.current = false;
    canvasRef.current?.releasePointerCapture(event.pointerId);

    const points = liveNormalizedPoints;
    setLiveNormalizedPoints(null);
    if (!points || points.length < 2) return;

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
