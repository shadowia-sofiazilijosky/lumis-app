"use client";

import { useEffect, useRef, useState } from "react";

/** Reports a ref'd element's live rendered size — used for the shelf canvas
 * while it's still CSS-driven (not yet manually resized), so it reacts to
 * the sidebar collapsing/expanding or any other layout change. */
export function useObservedSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      setSize({ width: rect.width, height: rect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}
