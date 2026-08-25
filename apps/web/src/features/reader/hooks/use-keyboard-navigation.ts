"use client";

import { useEffect } from "react";

/** ArrowLeft/ArrowUp = previous page, ArrowRight/ArrowDown = next — works
 * regardless of the current page-turn mode, ignored while typing in a
 * form field (notes, shelf/book titles elsewhere on the page, etc). */
export function useKeyboardNavigation(onPrev: () => void, onNext: () => void) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        onPrev();
      } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        onNext();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onPrev, onNext]);
}
