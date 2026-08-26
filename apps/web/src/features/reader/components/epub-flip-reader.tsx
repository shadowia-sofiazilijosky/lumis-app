"use client";

import type { Book, Rendition } from "epubjs";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useReaderStore } from "../store/reader-store";
import { FlipBook } from "./flip-book";
import { FlipLeaf } from "./flip-leaf";

const NEAR_WINDOW = 2;
// Rough characters-per-page target for epub.js's own pagination -- there's
// no "correct" value (it depends on font size/viewport), this just needs to
// produce a believable page count for the flip book.
const CHARS_PER_PAGE = 1600;

const EpubFlipLeaf = forwardRef<HTMLDivElement, { snapshot?: string }>(function EpubFlipLeaf(
  { snapshot },
  ref,
) {
  return (
    <FlipLeaf ref={ref}>
      {snapshot ? (
        // eslint-disable-next-line @next/next/no-img-element -- a data: URL snapshot, not a static asset
        <img src={snapshot} alt="" className="flip-book-image" />
      ) : null}
    </FlipLeaf>
  );
});

/**
 * EPUB is reflowable -- there's no fixed set of "page" DOM nodes the way
 * PDF/comics have, so react-pageflip (which needs one real element per leaf
 * up front) can't read it directly. This renders each nearby page into a
 * single hidden, off-screen epub.js rendition, one at a time, and snapshots
 * it to an image via html2canvas -- those snapshots become the flip book's
 * leaves. It's the most experimental piece of this feature: font rendering
 * in the snapshot can differ slightly from the live reader, and very long
 * books take a few seconds to paginate up front.
 */
export function EpubFlipReader({ fileUrl }: { fileUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const inFlightRef = useRef<Set<number>>(new Set());

  const [pageCfis, setPageCfis] = useState<string[] | null>(null);
  const [snapshots, setSnapshots] = useState<Record<number, string>>({});

  const currentPage = useReaderStore((state) => state.currentPage);
  const zoom = useReaderStore((state) => state.zoom);
  const goToPage = useReaderStore((state) => state.goToPage);
  const setTotalPages = useReaderStore((state) => state.setTotalPages);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const ePub = (await import("epubjs")).default;
      const book = ePub(fileUrl, { openAs: "epub" });
      bookRef.current = book;
      await book.ready;
      if (cancelled || !containerRef.current) return;

      const rendition = book.renderTo(containerRef.current, {
        width: 500,
        height: 720,
        flow: "paginated",
        spread: "none",
      });
      renditionRef.current = rendition;

      const locations = await book.locations.generate(CHARS_PER_PAGE);
      if (cancelled) return;
      setTotalPages(locations.length);
      setPageCfis(locations);
    })();

    return () => {
      cancelled = true;
      renditionRef.current?.destroy();
      bookRef.current?.destroy();
      renditionRef.current = null;
      bookRef.current = null;
    };
  }, [fileUrl, setTotalPages]);

  useEffect(() => {
    if (!pageCfis) return;

    const near: number[] = [];
    const start = Math.max(0, currentPage - 1 - NEAR_WINDOW);
    const end = Math.min(pageCfis.length - 1, currentPage - 1 + NEAR_WINDOW);
    for (let i = start; i <= end; i++) {
      if (!snapshots[i] && !inFlightRef.current.has(i)) near.push(i);
    }
    if (!near.length) return;

    near.forEach((i) => inFlightRef.current.add(i));

    queueRef.current = queueRef.current.then(async () => {
      const rendition = renditionRef.current;
      const container = containerRef.current;
      if (!rendition || !container) {
        near.forEach((i) => inFlightRef.current.delete(i));
        return;
      }

      const html2canvas = (await import("html2canvas")).default;

      for (const index of near) {
        try {
          await rendition.display(pageCfis[index]);
          await new Promise((resolve) => setTimeout(resolve, 100));
          const canvas = await html2canvas(container, { backgroundColor: null, useCORS: true });
          const dataUrl = canvas.toDataURL("image/png");
          setSnapshots((prev) => ({ ...prev, [index]: dataUrl }));
        } catch {
          // Best-effort -- this leaf just stays blank if the snapshot fails.
        } finally {
          inFlightRef.current.delete(index);
        }
      }
    });
  }, [pageCfis, currentPage, snapshots]);

  return (
    <>
      <div ref={containerRef} className="epub-flip-offscreen" aria-hidden="true" />
      {!pageCfis ? (
        <p className="flip-book-loading">Preparando el libro para pasar página real…</p>
      ) : (
        <FlipBook
          currentLeafIndex={currentPage - 1}
          onFlipTo={(index) => goToPage(index + 1)}
          spreadView
          aspectRatio={0.72}
          zoom={zoom}
        >
          {pageCfis.map((cfi, index) => (
            <EpubFlipLeaf key={cfi} snapshot={snapshots[index]} />
          ))}
        </FlipBook>
      )}
    </>
  );
}
