"use client";

import dynamic from "next/dynamic";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

// react-pageflip touches `document` at module scope (StPageFlip's internal
// canvas/DOM setup) -- load it only in the browser, never during SSR.
const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

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

/** Thin wrapper around react-pageflip: keeps its imperative, internally-
 * managed page index in sync with the reader store's `currentPage` in both
 * directions (external nav -- keyboard, resume position -- animates a real
 * flip; dragging inside the book updates the store back) without fighting
 * itself into a feedback loop. */
export const FlipBook = forwardRef<FlipBookHandle, FlipBookProps>(function FlipBook(
  { currentLeafIndex, onFlipTo, spreadView, aspectRatio, zoom, children },
  ref,
) {
  const bookRef = useRef<{ pageFlip: () => PageFlipApi } | null>(null);
  const lastSyncedIndex = useRef(currentLeafIndex);
  const initialized = useRef(false);

  interface PageFlipApi {
    flip: (page: number, corner?: "top" | "bottom") => void;
    turnToPage: (page: number) => void;
    getCurrentPageIndex: () => number;
    flipNext: (corner?: "top" | "bottom") => void;
    flipPrev: (corner?: "top" | "bottom") => void;
  }

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

  // A single leaf's box: in spread mode it's half of a wide "open book"
  // frame; in single-page mode the whole frame is one leaf.
  const leafHeight = 720;
  const leafWidth = Math.round(leafHeight * aspectRatio);

  return (
    <div
      className={`flip-book-frame${spreadView ? " flip-book-frame-spread" : ""}`}
      style={{ transform: `scale(${zoom})` }}
    >
      <HTMLFlipBook
        ref={bookRef}
        width={leafWidth}
        height={leafHeight}
        size="stretch"
        minWidth={220}
        maxWidth={leafWidth * 1.4}
        minHeight={320}
        maxHeight={leafHeight * 1.4}
        showCover={false}
        usePortrait={!spreadView}
        drawShadow
        flippingTime={500}
        maxShadowOpacity={0.5}
        mobileScrollSupport={false}
        clickEventForward
        useMouseEvents
        swipeDistance={30}
        showPageCorners
        disableFlipByClick={false}
        startPage={currentLeafIndex}
        startZIndex={10}
        autoSize
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
