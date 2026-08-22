"use client";

import { useRef } from "react";

const MIN_WIDTH = 320;
const MAX_WIDTH = 1600;
const MIN_HEIGHT = 220;
const MAX_HEIGHT = 1000;

type HandleDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const HANDLES: HandleDirection[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

interface ResizableCanvasBoxProps {
  width: number;
  height: number;
  onResize: (size: { width: number; height: number }) => void;
  onResizeEnd: (size: { width: number; height: number }) => void;
  children: React.ReactNode;
}

/** A box with 8 drag handles (editor-style: corners + edges) that lets the
 * user freely resize the shelf canvas, independently on each axis. */
export function ResizableCanvasBox({
  width,
  height,
  onResize,
  onResizeEnd,
  children,
}: ResizableCanvasBoxProps) {
  const startRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    direction: HandleDirection;
  } | null>(null);

  function handlePointerDown(direction: HandleDirection) {
    return (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
      startRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: width,
        startHeight: height,
        direction,
      };
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = startRef.current;
    if (!start || event.pointerId !== start.pointerId) return;

    const deltaX = event.clientX - start.startX;
    const deltaY = event.clientY - start.startY;
    const { direction } = start;

    let nextWidth = start.startWidth;
    let nextHeight = start.startHeight;

    if (direction.includes("e")) nextWidth = start.startWidth + deltaX;
    if (direction.includes("w")) nextWidth = start.startWidth - deltaX;
    if (direction.includes("s")) nextHeight = start.startHeight + deltaY;
    if (direction.includes("n")) nextHeight = start.startHeight - deltaY;

    onResize({
      width: clamp(Math.round(nextWidth), MIN_WIDTH, MAX_WIDTH),
      height: clamp(Math.round(nextHeight), MIN_HEIGHT, MAX_HEIGHT),
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!startRef.current || event.pointerId !== startRef.current.pointerId) return;
    startRef.current = null;
    onResizeEnd({ width, height });
  }

  return (
    <div
      className="resizable-canvas-box"
      style={{ width, height }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {children}
      {HANDLES.map((direction) => (
        <div
          key={direction}
          className={`resize-handle resize-handle-${direction}`}
          onPointerDown={handlePointerDown(direction)}
          role="presentation"
        />
      ))}
    </div>
  );
}
