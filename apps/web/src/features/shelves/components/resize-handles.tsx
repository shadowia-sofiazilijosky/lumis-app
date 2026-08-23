"use client";

import { RESIZE_HANDLE_DIRECTIONS, type ResizeHandleDirection } from "../hooks/use-resizable-box";

interface ResizeHandlesProps {
  onPointerDown: (direction: ResizeHandleDirection) => (event: React.PointerEvent<HTMLDivElement>) => void;
  className?: string;
}

/** The 8 corner/edge drag handles shared by the canvas box and each placed decoration/frame. */
export function ResizeHandles({ onPointerDown, className }: ResizeHandlesProps) {
  return (
    <>
      {RESIZE_HANDLE_DIRECTIONS.map((direction) => (
        <div
          key={direction}
          className={`resize-handle resize-handle-${direction} ${className ?? ""}`}
          onPointerDown={onPointerDown(direction)}
          role="presentation"
        />
      ))}
    </>
  );
}
