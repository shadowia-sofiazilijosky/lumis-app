"use client";

import { ReaderTheme } from "@lumis/shared-types";
import type { Book, Contents, Rendition } from "epubjs";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { deleteHighlight } from "../api/annotations-client";
import { useAnnotationsStore } from "../store/annotations-store";
import { useReaderStore } from "../store/reader-store";
import { EpubFlipReader } from "./epub-flip-reader";
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

/** Translates a click inside the epub.js iframe to outer-document (viewport) coordinates. */
function toOuterRect(event: MouseEvent): DOMRect {
  const target = event.target as HTMLElement | null;
  const frame = target?.ownerDocument?.defaultView?.frameElement as
    | HTMLIFrameElement
    | null
    | undefined;
  const frameRect = frame?.getBoundingClientRect();
  return new DOMRect(
    event.clientX + (frameRect?.left ?? 0),
    event.clientY + (frameRect?.top ?? 0),
    0,
    0,
  );
}

interface EpubReaderProps {
  bookId: string;
  fileUrl: string;
  initialLocator: unknown;
  zoom: number;
}

export interface EpubReaderHandle {
  next: () => void;
  prev: () => void;
}

interface EpubLocation {
  start: { cfi: string; percentage: number };
}

export const EpubReader = forwardRef<EpubReaderHandle, EpubReaderProps>(
  function EpubReader({ bookId, fileUrl, initialLocator, zoom }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<Book | null>(null);
    const renditionRef = useRef<Rendition | null>(null);
    const appliedAnnotationsRef = useRef<Set<string>>(new Set());
    const [flipTick, setFlipTick] = useState(0);
    const [renditionReady, setRenditionReady] = useState(false);

    const flipDirection = useReaderStore((state) => state.flipDirection);
    const pageTurnMode = useReaderStore((state) => state.pageTurnMode);
    const spreadView = useReaderStore((state) => state.spreadView);
    const theme = useReaderStore((state) => state.theme);
    const goToLocator = useReaderStore((state) => state.goToLocator);
    const setTotalPages = useReaderStore((state) => state.setTotalPages);

    const highlights = useAnnotationsStore((state) => state.highlights);
    const notes = useAnnotationsStore((state) => state.notes);
    const removeHighlightLocal = useAnnotationsStore((state) => state.removeHighlightLocal);
    const setPendingSelection = useAnnotationsStore((state) => state.setPendingSelection);
    const openExistingNote = useAnnotationsStore((state) => state.openExistingNote);

    useImperativeHandle(ref, () => ({
      next: () => renditionRef.current?.next(),
      prev: () => renditionRef.current?.prev(),
    }));

    const usesOwnRendition = pageTurnMode !== "flip";

    useEffect(() => {
      // "flip" mode owns its own rendition (EpubFlipReader, for snapshotting
      // pages into the flip book's leaves) -- mounting this one too would
      // just double-load the file for nothing.
      if (!usesOwnRendition) return;
      let cancelled = false;

      (async () => {
        const ePub = (await import("epubjs")).default;
        if (!containerRef.current || cancelled) return;

        // openAs must be explicit: epub.js sniffs the extension from the URL's
        // last "." to decide how to open it, and Supabase's signed URL query
        // string (?token=<jwt>) has dots of its own — the sniff finds one of
        // those instead of ".epub", silently falls back to "directory" mode,
        // and every request 404s. Force it so the archive path is used.
        const book = ePub(fileUrl, { openAs: "epub" });
        bookRef.current = book;
        setTotalPages(null);
        appliedAnnotationsRef.current = new Set();

        const rendition = book.renderTo(containerRef.current, {
          width: "100%",
          height: "100%",
          flow: "paginated",
          spread: spreadView ? "auto" : "none",
        });
        renditionRef.current = rendition;
        applyEpubTheme(rendition, theme);

        // epub.js renders 'mark' annotations as a bare, unstyled <a> inside
        // each section's iframe — style it into a small pin here, since our
        // page's own CSS can't reach across the iframe boundary.
        rendition.hooks.content.register((contents: Contents) => {
          contents.addStylesheetRules(
            {
              'a[ref="epubjs-mk"]': {
                display: "inline-block",
                width: "14px",
                height: "14px",
                "border-radius": "50%",
                background: "#8c2f39",
                border: "2px solid #fff",
                "box-shadow": "0 1px 3px rgba(0,0,0,0.4)",
                cursor: "pointer",
                transform: "translate(-4px, -4px)",
              },
            },
            "lumis-note-mark",
          );
        });

        rendition.on("relocated", (location: EpubLocation) => {
          setFlipTick((tick) => tick + 1);
          goToLocator(
            location.start.cfi,
            Math.round((location.start.percentage ?? 0) * 100),
          );
        });

        rendition.on("selected", (cfiRange: string, contents: Contents) => {
          const selection = contents.window.getSelection();
          const text = selection?.toString().trim() ?? "";
          if (!text || !selection || selection.rangeCount === 0) return;

          const domRange = selection.getRangeAt(0);
          const rect = domRange.getBoundingClientRect();
          const frame = contents.window.frameElement as HTMLIFrameElement | null;
          const frameRect = frame?.getBoundingClientRect();

          setPendingSelection({
            pageIndex: contents.sectionIndex,
            startOffset: 0,
            endOffset: text.length,
            text,
            cfi: cfiRange,
            rect: new DOMRect(
              rect.left + (frameRect?.left ?? 0),
              rect.top + (frameRect?.top ?? 0),
              rect.width,
              rect.height,
            ),
          });
        });

        const startCfi =
          typeof initialLocator === "string" ? initialLocator : undefined;
        await rendition.display(startCfi);
        if (!cancelled) setRenditionReady(true);
      })();

      return () => {
        cancelled = true;
        setRenditionReady(false);
        renditionRef.current?.destroy();
        bookRef.current?.destroy();
        renditionRef.current = null;
        bookRef.current = null;
      };
      // Deliberately excludes initialLocator: it's a one-time resume
      // position, re-running on every relocation would fight navigation.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileUrl, usesOwnRendition]);

    useEffect(() => {
      if (renditionRef.current) applyEpubTheme(renditionRef.current, theme);
    }, [theme]);

    useEffect(() => {
      renditionRef.current?.spread(spreadView ? "auto" : "none");
    }, [spreadView]);

    // EPUB text is reflowable, so "zoom" here means bigger text, not a
    // bigger raster page — epub.js re-paginates around the new font size,
    // so every line stays fully visible and reachable via prev/next instead
    // of needing to pan around a page like a fixed-layout PDF would.
    useEffect(() => {
      renditionRef.current?.themes.fontSize(`${Math.round(zoom * 100)}%`);
    }, [zoom]);

    // Applies highlights/notes (CFI-anchored ones only) as epub.js's own
    // annotation overlays — it persists and re-injects these across section
    // re-renders on its own, so each CFI only needs to be added once.
    useEffect(() => {
      const rendition = renditionRef.current;
      if (!rendition || !renditionReady) return;

      for (const highlight of highlights) {
        if (!highlight.cfi) continue;
        const key = `highlight:${highlight.cfi}`;
        if (appliedAnnotationsRef.current.has(key)) continue;
        appliedAnnotationsRef.current.add(key);

        rendition.annotations.highlight(
          highlight.cfi,
          {},
          async () => {
            if (!window.confirm("¿Quitar este resaltado?")) return;
            rendition.annotations.remove(highlight.cfi!, "highlight");
            removeHighlightLocal(highlight.id);
            await deleteHighlight(bookId, highlight.id);
          },
          "epub-highlight",
          {
            fill: highlight.color,
            "mix-blend-mode": "multiply",
          },
        );
      }

      for (const note of notes) {
        if (!note.cfi) continue;
        const key = `note:${note.cfi}`;
        if (appliedAnnotationsRef.current.has(key)) continue;
        appliedAnnotationsRef.current.add(key);

        // epub.js ignores className/styles for "mark" annotations — the pin
        // look comes from the stylesheet rule injected via hooks.content above.
        rendition.annotations.mark(note.cfi, {}, (event: MouseEvent) =>
          openExistingNote(note.id, toOuterRect(event)),
        );
      }
    }, [highlights, notes, renditionReady, bookId, removeHighlightLocal, openExistingNote]);

    if (pageTurnMode === "flip") {
      return <EpubFlipReader fileUrl={fileUrl} />;
    }

    return (
      <PageFlip flipKey={flipTick} direction={flipDirection} mode={pageTurnMode}>
        <div ref={containerRef} className="epub-reader-viewport" />
      </PageFlip>
    );
  },
);
