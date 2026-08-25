"use client";

import { useEffect, useRef, useState } from "react";
import type { PageTurnMode } from "../store/reader-store";

const TRANSITION_DURATION_MS = 320;

interface PageFlipProps {
  flipKey: string | number;
  direction: "forward" | "backward";
  mode: PageTurnMode;
  children: React.ReactNode;
}

/**
 * Wraps any reader's page content with a page-turn transition, so PDF/EPUB/
 * comic/text readers all share the same visual language. Three interchangeable
 * styles share one mechanism (a CSS class toggled for one animation's worth of
 * time): "flip" mimics a real book page turning in 3D, "horizontal"/"vertical"
 * slide the new page in from the direction of travel.
 */
export function PageFlip({ flipKey, direction, mode, children }: PageFlipProps) {
  const [animating, setAnimating] = useState(false);
  const prevKey = useRef(flipKey);

  useEffect(() => {
    if (flipKey === prevKey.current) return;
    prevKey.current = flipKey;
    setAnimating(true);
    const timeout = setTimeout(() => setAnimating(false), TRANSITION_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [flipKey]);

  const className = animating
    ? `page-flip-leaf page-flip-leaf-${mode}-${direction}`
    : "page-flip-leaf";

  return (
    <div className={`page-flip-stage page-flip-stage-${mode}`}>
      {/* No `key` here on purpose: stateful renderers (pdf.js canvas, epub.js
          iframe) live inside `children` and must stay mounted across a page
          turn — only this wrapper's transform animates. */}
      <div className={className}>{children}</div>
    </div>
  );
}
