"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { DrawTool } from "../store/annotations-store";

interface PenCursorProps {
  containerRef: RefObject<HTMLElement | null>;
  tool: DrawTool;
}

/** Follows the pointer over the reading area while the brush is active — an
 * image-editor-style brush preview, sized and colored to match what the
 * next stroke will actually paint. */
export function PenCursor({ containerRef, tool }: PenCursorProps) {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleMove(event: PointerEvent) {
      const dot = dotRef.current;
      if (!dot) return;
      dot.style.left = `${event.clientX}px`;
      dot.style.top = `${event.clientY}px`;
      dot.style.opacity = "1";
    }

    function handleLeave() {
      const dot = dotRef.current;
      if (dot) dot.style.opacity = "0";
    }

    container.addEventListener("pointermove", handleMove);
    container.addEventListener("pointerleave", handleLeave);
    return () => {
      container.removeEventListener("pointermove", handleMove);
      container.removeEventListener("pointerleave", handleLeave);
    };
  }, [containerRef]);

  return (
    <div
      ref={dotRef}
      className="pen-cursor"
      style={{ width: tool.size, height: tool.size, background: tool.color }}
    />
  );
}
