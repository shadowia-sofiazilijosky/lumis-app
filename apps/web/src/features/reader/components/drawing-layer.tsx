"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { createStroke, deleteStroke } from "../api/annotations-client";
import { getBrush, strokeToPath } from "../lib/brushes";
import { useAnnotationsStore } from "../store/annotations-store";

interface DrawingLayerProps {
  bookId: string;
  pageIndex: number;
  containerRef: RefObject<HTMLElement | null>;
  /** Bump whenever the page's own size may have changed (zoom, page turn). */
  refreshKey: string | number;
}

let filterIdCounter = 0;

/** Freehand brush drawing, independent of text — an SVG overlay the same
 * size as the page, storing/rendering stroke points normalized 0-1 against
 * that size so they re-scale correctly at any zoom level. */
export function DrawingLayer({ bookId, pageIndex, containerRef, refreshKey }: DrawingLayerProps) {
  const strokes = useAnnotationsStore((state) => state.strokes);
  const addStroke = useAnnotationsStore((state) => state.addStroke);
  const removeStrokeLocal = useAnnotationsStore((state) => state.removeStrokeLocal);
  const drawTool = useAnnotationsStore((state) => state.drawTool);

  const [filterId] = useState(() => `brush-grain-${filterIdCounter++}`);
  const svgRef = useRef<SVGSVGElement>(null);
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

  function toNormalized(clientX: number, clientY: number): [number, number] | null {
    const container = containerRef.current;
    if (!container || size.width === 0 || size.height === 0) return null;
    const rect = container.getBoundingClientRect();
    return [(clientX - rect.left) / rect.width, (clientY - rect.top) / rect.height];
  }

  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (!drawTool) return;
    const point = toNormalized(event.clientX, event.clientY);
    if (!point) return;
    drawing.current = true;
    svgRef.current?.setPointerCapture(event.pointerId);
    setLiveNormalizedPoints([point]);
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!drawing.current) return;
    const point = toNormalized(event.clientX, event.clientY);
    if (!point) return;
    setLiveNormalizedPoints((prev) => (prev ? [...prev, point] : [point]));
  }

  async function handlePointerUp(event: React.PointerEvent<SVGSVGElement>) {
    if (!drawing.current || !drawTool) return;
    drawing.current = false;
    svgRef.current?.releasePointerCapture(event.pointerId);

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

  async function handleDeleteStroke(id: string) {
    removeStrokeLocal(id);
    await deleteStroke(bookId, id);
  }

  const toPixels = (points: [number, number][]): [number, number][] =>
    points.map(([x, y]) => [x * size.width, y * size.height]);

  return (
    <svg
      ref={svgRef}
      className={`drawing-layer${drawTool ? " drawing-layer-active" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
          {/* Keep the stroke's own color, but modulate its opacity by the
              noise's alpha channel -- a grainy, uneven fill instead of a
              flat one, without replacing the chosen color with gray static. */}
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0"
            result="grain"
          />
          <feComposite in="SourceGraphic" in2="grain" operator="in" />
        </filter>
      </defs>

      {pageStrokes.map((stroke) => {
        const brush = getBrush(stroke.brush);
        const path = strokeToPath(toPixels(stroke.points), brush, stroke.size);
        return (
          <path
            key={stroke.id}
            d={path}
            fill={stroke.color}
            className={`drawn-stroke drawn-stroke-${brush.render}`}
            filter={brush.render === "textured" ? `url(#${filterId})` : undefined}
            onClick={() => handleDeleteStroke(stroke.id)}
          />
        );
      })}

      {liveNormalizedPoints && drawTool && (
        <path
          d={strokeToPath(toPixels(liveNormalizedPoints), getBrush(drawTool.brush), drawTool.size)}
          fill={drawTool.color}
          className={`drawn-stroke drawn-stroke-${getBrush(drawTool.brush).render}`}
          style={{ pointerEvents: "none" }}
        />
      )}
    </svg>
  );
}
