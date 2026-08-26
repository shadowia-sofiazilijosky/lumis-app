"use client";

import { BookFormat } from "@lumis/shared-types";
import { useEffect, useRef, useState } from "react";
import { fetchTextPage, pageImageUrl, type TextPage } from "../api/reader-client";
import { useReaderStore } from "../store/reader-store";
import { ComicFlipReader } from "./comic-flip-reader";
import { DrawingLayer } from "./drawing-layer";
import { PageFlip } from "./page-flip";
import { TextAnnotationLayer } from "./text-annotation-layer";

interface PaginatedReaderProps {
  bookId: string;
  format: typeof BookFormat.CBR | typeof BookFormat.CBZ | typeof BookFormat.TXT;
  zoom: number;
}

function TextSinglePage({
  bookId,
  pageNumber,
  totalPages,
  zoom,
}: {
  bookId: string;
  pageNumber: number;
  totalPages: number | null;
  zoom: number;
}) {
  const [loadedPage, setLoadedPage] = useState<TextPage | null>(null);
  const textPageRef = useRef<HTMLDivElement>(null);
  const inRange = pageNumber >= 1 && (totalPages === null || pageNumber <= totalPages);
  const text = loadedPage?.pageNumber === pageNumber ? loadedPage.text : null;

  useEffect(() => {
    if (!inRange) return;
    let cancelled = false;
    fetchTextPage(bookId, pageNumber).then((page) => {
      if (!cancelled) setLoadedPage(page);
    });
    return () => {
      cancelled = true;
    };
  }, [bookId, pageNumber, inRange]);

  if (!inRange) return <div className="text-reader-page text-reader-page-empty" />;

  return (
    <div ref={textPageRef} className="text-reader-page" style={{ fontSize: `${zoom * 100}%` }}>
      {text ? text.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>Cargando…</p>}
      <TextAnnotationLayer
        bookId={bookId}
        pageIndex={pageNumber - 1}
        containerRef={textPageRef}
        refreshKey={`${pageNumber}-${text ? "loaded" : "loading"}`}
      />
      <DrawingLayer
        bookId={bookId}
        pageIndex={pageNumber - 1}
        containerRef={textPageRef}
        refreshKey={`${pageNumber}-${zoom}`}
      />
    </div>
  );
}

function ComicSinglePage({
  bookId,
  pageNumber,
  totalPages,
  zoom,
}: {
  bookId: string;
  pageNumber: number;
  totalPages: number | null;
  zoom: number;
}) {
  const inRange = pageNumber >= 1 && (totalPages === null || pageNumber <= totalPages);
  if (!inRange) return <div className="comic-reader-page comic-reader-page-empty" />;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- proxied page image, not a static asset
    <img
      src={pageImageUrl(bookId, pageNumber)}
      alt={`Página ${pageNumber}`}
      className="comic-reader-page"
      style={zoom !== 1 ? { width: `${zoom * 100}%`, maxWidth: "none", height: "auto" } : undefined}
    />
  );
}

/**
 * Renders the backend-paginated formats: TXT gets real DOM text (selectable,
 * highlightable) and CBR/CBZ get a page image — there's no text to select on
 * a raster comic page, so those formats don't get the annotation layer.
 */
export function PaginatedReader({ bookId, format, zoom }: PaginatedReaderProps) {
  const currentPage = useReaderStore((state) => state.currentPage);
  const totalPages = useReaderStore((state) => state.totalPages);
  const flipDirection = useReaderStore((state) => state.flipDirection);
  const pageTurnMode = useReaderStore((state) => state.pageTurnMode);
  const spreadView = useReaderStore((state) => state.spreadView);

  const isText = format === BookFormat.TXT;

  // Comics get the real drag-to-curl page turn in "flip" mode -- each page
  // is already a flat image, an easy fit for the flip book's leaves. TXT
  // stays on the simple pipeline (reflowable text has no fixed page image).
  if (!isText && pageTurnMode === "flip") {
    return <ComicFlipReader bookId={bookId} />;
  }

  return (
    <PageFlip flipKey={currentPage} direction={flipDirection} mode={pageTurnMode}>
      <div className={spreadView ? (isText ? "text-spread" : "comic-spread") : undefined}>
        {isText ? (
          <TextSinglePage bookId={bookId} pageNumber={currentPage} totalPages={totalPages} zoom={zoom} />
        ) : (
          <ComicSinglePage bookId={bookId} pageNumber={currentPage} totalPages={totalPages} zoom={zoom} />
        )}
        {spreadView &&
          (isText ? (
            <TextSinglePage
              bookId={bookId}
              pageNumber={currentPage + 1}
              totalPages={totalPages}
              zoom={zoom}
            />
          ) : (
            <ComicSinglePage
              bookId={bookId}
              pageNumber={currentPage + 1}
              totalPages={totalPages}
              zoom={zoom}
            />
          ))}
      </div>
    </PageFlip>
  );
}
