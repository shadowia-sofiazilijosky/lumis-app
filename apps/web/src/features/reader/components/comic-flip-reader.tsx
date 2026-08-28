"use client";

import { useTranslations } from "next-intl";
import { forwardRef, useRef, useState } from "react";
import { pageImageUrl } from "../api/reader-client";
import { useReaderStore } from "../store/reader-store";
import { FlipBook, type FlipBookHandle } from "./flip-book";
import { FlipLeaf } from "./flip-leaf";

const NEAR_WINDOW = 3;

const ComicFlipLeaf = forwardRef<
  HTMLDivElement,
  { bookId: string; pageNumber: number; isNear: boolean }
>(function ComicFlipLeaf({ bookId, pageNumber, isNear }, ref) {
  const t = useTranslations("reader");
  return (
    <FlipLeaf ref={ref}>
      {isNear && (
        // eslint-disable-next-line @next/next/no-img-element -- proxied page image, not a static asset
        <img
          src={pageImageUrl(bookId, pageNumber)}
          alt={t("pageAlt", { page: pageNumber })}
          className="flip-book-image"
        />
      )}
    </FlipLeaf>
  );
});

export function ComicFlipReader({ bookId }: { bookId: string }) {
  const [aspectRatio] = useState(0.72);
  const flipBookRef = useRef<FlipBookHandle>(null);

  const currentPage = useReaderStore((state) => state.currentPage);
  const totalPages = useReaderStore((state) => state.totalPages);
  const spreadView = useReaderStore((state) => state.spreadView);
  const zoom = useReaderStore((state) => state.zoom);
  const goToPage = useReaderStore((state) => state.goToPage);

  if (!totalPages) {
    return <p className="flip-book-loading">Preparando el libro…</p>;
  }

  return (
    <FlipBook
      ref={flipBookRef}
      currentLeafIndex={currentPage - 1}
      onFlipTo={(index) => goToPage(index + 1)}
      spreadView={spreadView}
      aspectRatio={aspectRatio}
      zoom={zoom}
    >
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
        <ComicFlipLeaf
          key={`${bookId}-${pageNumber}`}
          bookId={bookId}
          pageNumber={pageNumber}
          isNear={Math.abs(pageNumber - currentPage) <= NEAR_WINDOW}
        />
      ))}
    </FlipBook>
  );
}
