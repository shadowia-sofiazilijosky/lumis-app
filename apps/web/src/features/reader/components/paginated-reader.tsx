"use client";

import { BookFormat } from "@lumis/shared-types";
import { useEffect, useRef, useState } from "react";
import { fetchTextPage, pageImageUrl, type TextPage } from "../api/reader-client";
import { useReaderStore } from "../store/reader-store";
import { PageFlip } from "./page-flip";
import { TextAnnotationLayer } from "./text-annotation-layer";

interface PaginatedReaderProps {
  bookId: string;
  format: typeof BookFormat.CBR | typeof BookFormat.CBZ | typeof BookFormat.TXT;
  zoom: number;
}

/**
 * Renders the backend-paginated formats: TXT gets real DOM text (selectable,
 * highlightable) and CBR/CBZ get a page image — there's no text to select on
 * a raster comic page, so those formats don't get the annotation layer.
 */
export function PaginatedReader({ bookId, format, zoom }: PaginatedReaderProps) {
  const currentPage = useReaderStore((state) => state.currentPage);
  const flipDirection = useReaderStore((state) => state.flipDirection);
  const pageTurnMode = useReaderStore((state) => state.pageTurnMode);
  const [loadedPage, setLoadedPage] = useState<TextPage | null>(null);
  const textPageRef = useRef<HTMLDivElement>(null);

  const isText = format === BookFormat.TXT;
  const text = loadedPage?.pageNumber === currentPage ? loadedPage.text : null;

  useEffect(() => {
    if (!isText) return;
    let cancelled = false;
    fetchTextPage(bookId, currentPage).then((page) => {
      if (!cancelled) setLoadedPage(page);
    });
    return () => {
      cancelled = true;
    };
  }, [bookId, currentPage, isText]);

  return (
    <PageFlip flipKey={currentPage} direction={flipDirection} mode={pageTurnMode}>
      {isText ? (
        <div
          ref={textPageRef}
          className="text-reader-page"
          style={{ fontSize: `${zoom * 100}%` }}
        >
          {text
            ? text
                .split("\n\n")
                .map((paragraph, index) => <p key={index}>{paragraph}</p>)
            : <p>Cargando…</p>}
          <TextAnnotationLayer
            bookId={bookId}
            pageIndex={currentPage - 1}
            containerRef={textPageRef}
            refreshKey={`${currentPage}-${text ? "loaded" : "loading"}`}
          />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- proxied page image, not a static asset
        <img
          src={pageImageUrl(bookId, currentPage)}
          alt={`Página ${currentPage}`}
          className="comic-reader-page"
          style={
            zoom !== 1
              ? { width: `${zoom * 100}%`, maxWidth: "none", height: "auto" }
              : undefined
          }
        />
      )}
    </PageFlip>
  );
}
