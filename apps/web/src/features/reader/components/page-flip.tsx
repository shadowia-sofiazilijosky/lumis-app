"use client";

import { useEffect, useRef, useState } from "react";

const FLIP_DURATION_MS = 320;

interface PageFlipProps {
  flipKey: string | number;
  direction: "forward" | "backward";
  children: React.ReactNode;
}

/**
 * Wraps any reader's page content with a physical-book page-turn transition,
 * so PDF/EPUB/comic/text readers all share the same visual language.
 */
export function PageFlip({ flipKey, direction, children }: PageFlipProps) {
  const [animating, setAnimating] = useState(false);
  const prevKey = useRef(flipKey);

  useEffect(() => {
    if (flipKey === prevKey.current) return;
    prevKey.current = flipKey;
    setAnimating(true);
    const timeout = setTimeout(() => setAnimating(false), FLIP_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [flipKey]);

  return (
    <div className="page-flip-stage">
      {/* No `key` here on purpose: stateful renderers (pdf.js canvas, epub.js
          iframe) live inside `children` and must stay mounted across a page
          turn — only this wrapper's transform animates. */}
      <div
        className={
          animating
            ? `page-flip-leaf page-flip-leaf-${direction}`
            : "page-flip-leaf"
        }
      >
        {children}
      </div>
    </div>
  );
}
