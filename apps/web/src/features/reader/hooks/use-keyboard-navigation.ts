"use client";

import { useEffect } from "react";
import type { PageTurnMode } from "../store/reader-store";

const VERTICAL_SCROLL_STEP = 220;
const AT_EDGE_TOLERANCE = 4;

interface UseKeyboardNavigationOptions {
  mode: PageTurnMode;
  scrollContainerRef: React.RefObject<HTMLElement | null>;
}

/** ArrowLeft/Right always turn the page immediately. ArrowUp/Down do too,
 * EXCEPT in "vertical" (continuous-scroll) mode: there they scroll the
 * viewport down/up a bit at a time — like a native PDF viewer's continuous
 * scroll — only turning the page once you're already at the very top/bottom.
 * Ignored while typing in a form field. */
export function useKeyboardNavigation(
  onPrev: () => void,
  onNext: () => void,
  { mode, scrollContainerRef }: UseKeyboardNavigationOptions,
) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      const isDown = event.key === "ArrowDown";
      const isUp = event.key === "ArrowUp";

      if (mode === "vertical" && (isDown || isUp)) {
        const container = scrollContainerRef.current;
        if (container) {
          event.preventDefault();
          if (isDown) {
            const atBottom =
              container.scrollTop + container.clientHeight >=
              container.scrollHeight - AT_EDGE_TOLERANCE;
            if (!atBottom) {
              container.scrollBy({ top: VERTICAL_SCROLL_STEP, behavior: "smooth" });
              return;
            }
            onNext();
            container.scrollTo({ top: 0 });
            return;
          }

          const atTop = container.scrollTop <= AT_EDGE_TOLERANCE;
          if (!atTop) {
            container.scrollBy({ top: -VERTICAL_SCROLL_STEP, behavior: "smooth" });
            return;
          }
          onPrev();
          return;
        }
      }

      if (event.key === "ArrowLeft" || isUp) {
        event.preventDefault();
        onPrev();
      } else if (event.key === "ArrowRight" || isDown) {
        event.preventDefault();
        onNext();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onPrev, onNext, mode, scrollContainerRef]);
}
