"use client";

import { ReaderTheme } from "@lumis/shared-types";
import type { Book, Rendition } from "epubjs";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useReaderStore } from "../store/reader-store";
import { PageFlip } from "./page-flip";

const EPUB_THEME_PALETTE: Record<ReaderTheme, { background: string; color: string }> = {
  LIGHT: { background: "#f7e6e6", color: "#3b2226" },
  DARK: { background: "#1a1a1a", color: "#e8e8e8" },
  SEPIA: { background: "#f4ecd8", color: "#5b4636" },
};

function applyEpubTheme(rendition: Rendition, theme: ReaderTheme) {
  const palette = EPUB_THEME_PALETTE[theme];
  rendition.themes.default({ body: { background: palette.background, color: palette.color } });
}

interface EpubReaderProps {
  fileUrl: string;
  initialLocator: unknown;
}

export interface EpubReaderHandle {
  next: () => void;
  prev: () => void;
}

interface EpubLocation {
  start: { cfi: string; percentage: number };
}

export const EpubReader = forwardRef<EpubReaderHandle, EpubReaderProps>(
  function EpubReader({ fileUrl, initialLocator }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<Book | null>(null);
    const renditionRef = useRef<Rendition | null>(null);
    const [flipTick, setFlipTick] = useState(0);

    const flipDirection = useReaderStore((state) => state.flipDirection);
    const theme = useReaderStore((state) => state.theme);
    const goToLocator = useReaderStore((state) => state.goToLocator);
    const setTotalPages = useReaderStore((state) => state.setTotalPages);

    useImperativeHandle(ref, () => ({
      next: () => renditionRef.current?.next(),
      prev: () => renditionRef.current?.prev(),
    }));

    useEffect(() => {
      let cancelled = false;

      (async () => {
        const ePub = (await import("epubjs")).default;
        if (!containerRef.current || cancelled) return;

        const book = ePub(fileUrl);
        bookRef.current = book;
        setTotalPages(null);

        const rendition = book.renderTo(containerRef.current, {
          width: "100%",
          height: "100%",
          flow: "paginated",
          spread: "none",
        });
        renditionRef.current = rendition;
        applyEpubTheme(rendition, theme);

        rendition.on("relocated", (location: EpubLocation) => {
          setFlipTick((tick) => tick + 1);
          goToLocator(
            location.start.cfi,
            Math.round((location.start.percentage ?? 0) * 100),
          );
        });

        const startCfi =
          typeof initialLocator === "string" ? initialLocator : undefined;
        await rendition.display(startCfi);
      })();

      return () => {
        cancelled = true;
        renditionRef.current?.destroy();
        bookRef.current?.destroy();
        renditionRef.current = null;
        bookRef.current = null;
      };
      // Deliberately only re-runs on fileUrl: initialLocator is a one-time
      // resume position, re-running on every relocation would fight navigation.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileUrl]);

    useEffect(() => {
      if (renditionRef.current) applyEpubTheme(renditionRef.current, theme);
    }, [theme]);

    return (
      <PageFlip flipKey={flipTick} direction={flipDirection}>
        <div ref={containerRef} className="epub-reader-viewport" />
      </PageFlip>
    );
  },
);
