"use client";

import { useEffect, useRef, useState } from "react";

/** Tracks a container's rendered width and returns the scale factor to fit a fixed-size logical canvas inside it. */
export function useCanvasScale(logicalWidth: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setScale(width / logicalWidth);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [logicalWidth]);

  return { containerRef, scale };
}
