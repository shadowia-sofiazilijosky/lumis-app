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
  /** True while no manual size has been saved yet — the box fills its
   * container responsively (grows/shrinks with the sidebar, window, etc.)
   * instead of being pinned to explicit pixel dimensions. */
  auto: boolean;
  aspectRatio: number;
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
  auto,
  aspectRatio,
  boxRef,
  onResize,
  onResizeEnd,
  showHandles,
  children,
}: ResizableCanvasBoxProps) {
  const { onPointerDown, onPointerMove, onPointerUp, liveOffset, isResizing } =
    useResizableBox({
      width,
      height,
      minWidth: MIN_WIDTH,
      maxWidth: MAX_WIDTH,
      minHeight: MIN_HEIGHT,
      maxHeight: MAX_HEIGHT,
      onResize,
      onResizeEnd,
    });

  const sizeStyle =
    auto && !isResizing
      ? { width: "100%", aspectRatio: `${aspectRatio}` }
      : { width, height };

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
