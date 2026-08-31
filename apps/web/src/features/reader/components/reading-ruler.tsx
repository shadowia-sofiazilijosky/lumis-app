"use client";

import { useEffect, useState, type RefObject } from "react";
import { useReaderStore } from "../store/reader-store";

const RULER_HEIGHT_PX = 32;

interface ViewportRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * A soft "line focus" guide that follows the pointer/touch vertically over
 * the reading area, dimming everything else so the eye locks onto roughly
 * one line at a time — purely visual, never intercepts a click meant for
 * text selection or a page-turn tap (the whole overlay is
 * pointer-events: none, and its own mousemove/touchmove listeners are
 * attached straight to the reading container, not the page).
 *
 * Positioned with `position: fixed` from the container's own
 * getBoundingClientRect(), not `position: absolute` inside it -- the
 * container scrolls in "vertical" page-turn mode, and an absolutely
 * positioned child would scroll away with the content instead of tracking
 * where the pointer actually is on screen.
 */
export function ReadingRuler({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const enabled = useReaderStore((state) => state.readingRulerEnabled);
  const [rect, setRect] = useState<ViewportRect | null>(null);
  const [offsetY, setOffsetY] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setRect(null);
      setOffsetY(null);
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    function measure() {
      const box = container!.getBoundingClientRect();
      setRect({ left: box.left, top: box.top, width: box.width, height: box.height });
    }

    function place(clientY: number) {
      const box = container!.getBoundingClientRect();
      setOffsetY(Math.min(Math.max(clientY - box.top, 0), box.height));
    }

    measure();

    function handleMouseMove(event: MouseEvent) {
      place(event.clientY);
    }
    function handleTouchMove(event: TouchEvent) {
      const touch = event.touches[0];
      if (touch) place(touch.clientY);
    }

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", measure);
    };
  }, [enabled, containerRef]);

  if (!enabled || !rect || offsetY === null) return null;

  return (
    <div
      className="reading-ruler"
      aria-hidden="true"
      style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
    >
      <div
        className="reading-ruler-window"
        style={{ transform: `translateY(${offsetY - RULER_HEIGHT_PX / 2}px)` }}
      />
    </div>
  );
}
