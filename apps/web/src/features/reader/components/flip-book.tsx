"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface FlipBookHandle {
  flipNext: () => void;
  flipPrev: () => void;
}

interface FlipBookProps {
  /** 0-based leaf index, the single source of truth from the reader store. */
  currentLeafIndex: number;
  /** Called when the book itself changes page (drag, corner click) --
   * feed this back into the reader store's page state. */
  onFlipTo: (leafIndex: number) => void;
  spreadView: boolean;
  /** Single page's own width/height ratio, so leaves aren't stretched/squashed. */
  aspectRatio: number;
  zoom: number;
  children: React.ReactNode;
}

interface PageFlipApi {
  flip: (page: number, corner?: "top" | "bottom") => void;
  turnToPage: (page: number) => void;
  getCurrentPageIndex: () => number;
  flipNext: (corner?: "top" | "bottom") => void;
  flipPrev: (corner?: "top" | "bottom") => void;
}

type HTMLFlipBookComponent = typeof import("react-pageflip")["default"];

/** Thin wrapper around react-pageflip: keeps its imperative, internally-
 * managed page index in sync with the reader store's `currentPage` in both
 * directions (external nav -- keyboard, resume position -- animates a real
 * flip; dragging inside the book updates the store back) without fighting
 * itself into a feedback loop.
 *
 * Sizing is computed here in real pixels (not left to react-pageflip's own
 * "stretch" auto-sizing) and zoom is a real size multiplier, not a CSS
 * `transform: scale()` -- a transform doesn't change layout size, so the
 * surrounding scroll container has no idea the book grew and just clips it,
 * exactly like the earlier PDF zoom bug this session already hit once.
 *
 * react-pageflip doesn't actually resize a live instance when its
 * width/height props change -- there's no such method in its public API --
 * so the whole book is deliberately remounted (via `key`) whenever the
 * target size changes; that's the only way zoom can take effect at all. */
export const FlipBook = forwardRef<FlipBookHandle, FlipBookProps>(function FlipBook(
  { currentLeafIndex, onFlipTo, spreadView, aspectRatio, zoom, children },
  ref,
) {
  const bookRef = useRef<{ pageFlip: () => PageFlipApi } | null>(null);
  const lastSyncedIndex = useRef(currentLeafIndex);
  const initialized = useRef(false);
  const [viewport, setViewport] = useState({ width: 900, height: 700 });
  // Loaded imperatively (not next/dynamic) -- dynamic(ssr:false) has a known
  // failure mode where the resolved component doesn't always get painted
  // until some unrelated state change forces React to reconcile again,
  // which read as "the page stays blank until I touch zoom".
  const [HTMLFlipBook, setHTMLFlipBook] = useState<HTMLFlipBookComponent | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("react-pageflip").then((mod) => {
      if (!cancelled) setHTMLFlipBook(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function measure() {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useImperativeHandle(ref, () => ({
    flipNext: () => bookRef.current?.pageFlip().flipNext(),
    flipPrev: () => bookRef.current?.pageFlip().flipPrev(),
  }));

  useEffect(() => {
    if (currentLeafIndex === lastSyncedIndex.current) return;
    const api = bookRef.current?.pageFlip();
    if (!api) return;
    lastSyncedIndex.current = currentLeafIndex;
    if (!initialized.current) {
      api.turnToPage(currentLeafIndex);
    } else {
      api.flip(currentLeafIndex);
    }
  }, [currentLeafIndex]);

  function handleInit() {
    initialized.current = true;
  }

  function handleFlip(event: { data: number }) {
    lastSyncedIndex.current = event.data;
    onFlipTo(event.data);
  }

  // Fit the page(s) inside the available window space (leaving room for the
  // top/bottom control bars), honoring the aspect ratio and whether it's a
  // single page or a two-page spread, then apply zoom as a real size
  // multiplier so it genuinely overflows (and becomes scrollable) instead
  // of being clipped.
  const availableWidth = viewport.width * 0.9;
  const availableHeight = Math.max(320, viewport.height - 220);
  const pagesAcross = spreadView ? 2 : 1;
  const heightFromWidth = availableWidth / pagesAcross / aspectRatio;
  const baseLeafHeight = Math.min(availableHeight, heightFromWidth);
  const leafHeight = Math.round(baseLeafHeight * zoom);
  const leafWidth = Math.round(leafHeight * aspectRatio);

  if (!HTMLFlipBook) {
    return <p className="flip-book-loading">Preparando el libro…</p>;
  }

  return (
    <div className="flip-book-frame">
      <HTMLFlipBook
        key={`${leafWidth}x${leafHeight}-${spreadView}`}
        ref={bookRef}
        width={leafWidth}
        height={leafHeight}
        size="fixed"
        minWidth={leafWidth}
        maxWidth={leafWidth}
        minHeight={leafHeight}
        maxHeight={leafHeight}
        showCover={false}
        usePortrait={!spreadView}
        drawShadow
        flippingTime={500}
        maxShadowOpacity={0.5}
        mobileScrollSupport={false}
        clickEventForward
        useMouseEvents
        swipeDistance={30}
        showPageCorners={false}
        disableFlipByClick={false}
        startPage={currentLeafIndex}
        startZIndex={10}
        autoSize={false}
        renderOnlyPageLengthChange={false}
        className="flip-book"
        style={{}}
        onInit={handleInit}
        onFlip={handleFlip}
      >
        {children}
      </HTMLFlipBook>
    </div>
  );
});
