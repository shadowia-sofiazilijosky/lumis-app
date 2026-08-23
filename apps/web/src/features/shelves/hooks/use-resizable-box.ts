"use client";

import { useRef, useState } from "react";

export type ResizeHandleDirection =
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

export const RESIZE_HANDLE_DIRECTIONS: ResizeHandleDirection[] = [
  "n",
  "s",
  "e",
  "w",
  "ne",
  "nw",
  "se",
  "sw",
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

interface UseResizableBoxOptions {
  width: number;
  height: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  onResize: (size: { width: number; height: number }) => void;
  onResizeEnd: (size: { width: number; height: number }) => void;
}

/**
 * Drives an editor-style 8-handle resize. Growing from a north/west edge
 * also shifts the box by the same amount it grew (via a live CSS transform,
 * reset once the drag ends) so the dragged edge visually tracks the
 * pointer — like an image crop — instead of the box silently growing from
 * its fixed top-left corner while the cursor drifts away from the edge.
 */
export function useResizableBox({
  width,
  height,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  onResize,
  onResizeEnd,
}: UseResizableBoxOptions) {
  const startRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    direction: ResizeHandleDirection;
  } | null>(null);
  const [liveOffset, setLiveOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);

  function onPointerDown(direction: ResizeHandleDirection) {
    return (event: React.PointerEvent<HTMLElement>) => {
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
      setIsResizing(true);
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
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

    nextWidth = clamp(Math.round(nextWidth), minWidth, maxWidth);
    nextHeight = clamp(Math.round(nextHeight), minHeight, maxHeight);

    // The dragged west/north edge should track the pointer, so the box has
    // to shift by exactly the growth it picked up on that axis — otherwise
    // it only ever grows toward the bottom-right and the edge you're
    // dragging drifts away from the cursor.
    setLiveOffset({
      x: direction.includes("w") ? -(nextWidth - start.startWidth) : 0,
      y: direction.includes("n") ? -(nextHeight - start.startHeight) : 0,
    });

    onResize({ width: nextWidth, height: nextHeight });
  }

  function onPointerUp(event: React.PointerEvent<HTMLElement>) {
    if (!startRef.current || event.pointerId !== startRef.current.pointerId) return;
    startRef.current = null;
    setLiveOffset({ x: 0, y: 0 });
    setIsResizing(false);
    onResizeEnd({ width, height });
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    liveOffset,
    isResizing,
  };
}
