"use client";

import { BookFormat } from "@lumis/shared-types";
import { useEffect, useState } from "react";
import { fetchTextPage, pageImageUrl, type TextPage } from "../api/reader-client";
import { useReaderStore } from "../store/reader-store";
import { PageFlip } from "./page-flip";

interface PaginatedReaderProps {
  bookId: string;
  format: typeof BookFormat.CBR | typeof BookFormat.CBZ | typeof BookFormat.TXT;
}

/** Renders the backend-paginated formats (CBR/CBZ page images, TXT page text). */
export function PaginatedReader({ bookId, format }: PaginatedReaderProps) {
  const currentPage = useReaderStore((state) => state.currentPage);
  const flipDirection = useReaderStore((state) => state.flipDirection);
  const [loadedPage, setLoadedPage] = useState<TextPage | null>(null);

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
    <PageFlip flipKey={currentPage} direction={flipDirection}>
      {isText ? (
        <div className="text-reader-page">
          {text
            ? text
                .split("\n\n")
                .map((paragraph, index) => <p key={index}>{paragraph}</p>)
            : <p>Cargando…</p>}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- proxied page image, not a static asset
        <img
          src={pageImageUrl(bookId, currentPage)}
          alt={`Página ${currentPage}`}
          className="comic-reader-page"
        />
      )}
    </PageFlip>
  );
}
