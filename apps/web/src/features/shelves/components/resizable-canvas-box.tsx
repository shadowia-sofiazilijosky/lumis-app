"use client";

import { useResizableBox } from "../hooks/use-resizable-box";
import { ResizeHandles } from "./resize-handles";

const MIN_WIDTH = 320;
const MAX_WIDTH = 2400;
const MIN_HEIGHT = 220;
const MAX_HEIGHT = 1600;

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
  const { onPointerDown, onPointerMove, onPointerUp, liveOffset } = useResizableBox({
    width,
    height,
    minWidth: MIN_WIDTH,
    maxWidth: MAX_WIDTH,
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
    onResize,
    onResizeEnd,
  });

  return (
    <div
      className="resizable-canvas-box"
      style={{
        width,
        height,
        transform: `translate(${liveOffset.x}px, ${liveOffset.y}px)`,
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {children}
      <ResizeHandles onPointerDown={onPointerDown} />
    </div>
  );
}
