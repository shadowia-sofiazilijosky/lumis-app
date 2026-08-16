"use client";

import { useEffect } from "react";
import { useReaderStore } from "../store/reader-store";

const CENTER_BAND_START = 0.3;
const CENTER_BAND_END = 0.7;

/**
 * Text-selectable readers (PDF/EPUB/TXT) can't use an opaque center tap-zone
 * button — it would sit on top of the text and block drag-to-select. Instead
 * this listens for a plain tap (a mouseup that produced no text selection)
 * landing in the middle band of the viewport and toggles controls from that.
 */
export function useTapToToggleControls(enabled: boolean) {
  const toggleControls = useReaderStore((state) => state.toggleControls);

  useEffect(() => {
    if (!enabled) return;

    function handleMouseUp(event: MouseEvent) {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest(".selection-toolbar, .note-popover, .highlight-mark, .note-pin")
      ) {
        return;
      }

      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && selection.toString()) return;

      const xRatio = event.clientX / window.innerWidth;
      if (xRatio < CENTER_BAND_START || xRatio > CENTER_BAND_END) return;

      toggleControls();
    }

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [enabled, toggleControls]);
}
