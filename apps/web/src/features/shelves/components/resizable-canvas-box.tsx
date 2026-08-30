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
  /** Screen-to-logical pixel ratio -- this box may render inside a
   * `zoom`-scaled ancestor (see shelf-canvas.tsx), so pointer deltas need
   * converting back to the box's own logical pixels before being applied. */
  scale: number;
  boxRef: React.Ref<HTMLDivElement>;
  onResize: (size: { width: number; height: number }) => void;
  onResizeEnd: (size: { width: number; height: number }) => void;
  /** Only show/allow the resize handles while true (edit mode). */
  showHandles: boolean;
  children: React.ReactNode;
}

/** A box with 8 drag handles (editor-style: corners + edges) that lets the
 * user freely resize the shelf canvas, independently on each axis. */
export function ResizableCanvasBox({
  width,
  height,
  scale,
  boxRef,
  onResize,
  onResizeEnd,
  showHandles,
  children,
}: ResizableCanvasBoxProps) {
  const { onPointerDown, onPointerMove, onPointerUp, liveOffset } =
    useResizableBox({
      width,
      height,
      scale,
      minWidth: MIN_WIDTH,
      maxWidth: MAX_WIDTH,
      minHeight: MIN_HEIGHT,
      maxHeight: MAX_HEIGHT,
      onResize,
      onResizeEnd,
    });

  const sizeStyle = { width, height };

  return (
    <div
      ref={boxRef}
      className="resizable-canvas-box"
      style={{
        ...sizeStyle,
        transform: `translate(${liveOffset.x}px, ${liveOffset.y}px)`,
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {children}
      {showHandles && <ResizeHandles onPointerDown={onPointerDown} />}
    </div>
  );
}
