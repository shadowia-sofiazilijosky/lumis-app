"use client";

import { useEffect, useRef } from "react";
import type { PageTurnMode } from "../store/reader-store";

const SWIPE_MIN_DISTANCE = 60;
/** How much more the dominant axis has to move than the cross axis to count
 * as an intentional swipe, not a diagonal drag or an accidental brush. */
const SWIPE_AXIS_RATIO = 1.5;

interface UseReaderGesturesOptions {
  onPrev: () => void;
  onNext: () => void;
  mode: PageTurnMode;
  zoom: number;
  setZoom: (zoom: number) => void;
}

function distance(a: Touch, b: Touch): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

/** Touch swipe (page turn) + pinch (zoom) + ctrl/cmd+wheel (zoom) on one
 * container — all three need to share the same touch listeners to avoid
 * fighting over the same gesture. */
export function useReaderGestures(
  containerRef: React.RefObject<HTMLElement | null>,
  { onPrev, onNext, mode, zoom, setZoom }: UseReaderGesturesOptions,
) {
  const touchState = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    pinchStartDistance: number | null;
    pinchStartZoom: number;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleTouchStart(event: TouchEvent) {
      if (event.touches.length === 2) {
        touchState.current = {
          startX: 0,
          startY: 0,
          startTime: 0,
          pinchStartDistance: distance(event.touches[0], event.touches[1]),
          pinchStartZoom: zoom,
        };
        return;
      }
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        touchState.current = {
          startX: touch.clientX,
          startY: touch.clientY,
          startTime: Date.now(),
          pinchStartDistance: null,
          pinchStartZoom: zoom,
        };
      }
    }

    function handleTouchMove(event: TouchEvent) {
      const state = touchState.current;
      if (!state || event.touches.length !== 2 || state.pinchStartDistance === null) {
        return;
      }
      event.preventDefault();
      const currentDistance = distance(event.touches[0], event.touches[1]);
      const nextZoom =
        state.pinchStartZoom * (currentDistance / state.pinchStartDistance);
      setZoom(nextZoom);
    }

    function handleTouchEnd(event: TouchEvent) {
      const state = touchState.current;
      touchState.current = null;
      if (!state || state.pinchStartDistance !== null) return;
      // Zoomed in: a one-finger drag is for panning the zoomed page, not
      // turning it — let the browser's native scroll handle that instead.
      if (zoom > 1.05) return;

      const touch = event.changedTouches[0];
      if (!touch) return;
      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;
      const elapsed = Date.now() - state.startTime;
      if (elapsed > 600) return;

      const isVertical = mode === "vertical";
      const primary = isVertical ? deltaY : deltaX;
      const cross = isVertical ? deltaX : deltaY;

      if (Math.abs(primary) < SWIPE_MIN_DISTANCE) return;
      if (Math.abs(primary) < Math.abs(cross) * SWIPE_AXIS_RATIO) return;

      if (primary < 0) onNext();
      else onPrev();
    }

    function handleWheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      setZoom(zoom + delta);
    }

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("wheel", handleWheel);
    };
  }, [containerRef, onPrev, onNext, mode, zoom, setZoom]);
}
