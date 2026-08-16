"use client";

import { useEffect, useRef } from "react";
import { useReaderStore } from "../store/reader-store";

const AUTO_HIDE_DELAY_MS = 3500;

/** Auto-hides the reader controls a few seconds after they're shown. */
export function useAutoHideControls() {
  const controlsVisible = useReaderStore((state) => state.controlsVisible);
  const hideControls = useReaderStore((state) => state.hideControls);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!controlsVisible) return;

    timeoutRef.current = setTimeout(hideControls, AUTO_HIDE_DELAY_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [controlsVisible, hideControls]);
}
