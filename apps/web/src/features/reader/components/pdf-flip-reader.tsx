"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useReaderStore } from "../store/reader-store";
import { FlipBook, type FlipBookHandle } from "./flip-book";
import { FlipLeaf } from "./flip-leaf";

const RENDER_SCALE = 1.6;
const NEAR_WINDOW = 3;

interface PdfFlipLeafProps {
  doc: PDFDocumentProxy;
  pageNumber: number;
  isNear: boolean;
}

const PdfFlipLeaf = forwardRef<HTMLDivElement, PdfFlipLeafProps>(function PdfFlipLeaf(
  { doc, pageNumber, isNear },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    if (!isNear || rendered.current) return;
    let cancelled = false;

    (async () => {
      const page = await doc.getPage(pageNumber);
      if (cancelled) return;
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;

      const viewport = page.getViewport({ scale: RENDER_SCALE });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport, canvas }).promise;
      if (!cancelled) rendered.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [doc, pageNumber, isNear]);

  return (
    <FlipLeaf ref={ref}>
      <canvas ref={canvasRef} className="flip-book-canvas" />
    </FlipLeaf>
  );
});

export function PdfFlipReader({ bookId, fileUrl }: { bookId: string; fileUrl: string }) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [aspectRatio, setAspectRatio] = useState(0.72);
  const flipBookRef = useRef<FlipBookHandle>(null);

  const currentPage = useReaderStore((state) => state.currentPage);
  const totalPages = useReaderStore((state) => state.totalPages);
  const spreadView = useReaderStore((state) => state.spreadView);
  const zoom = useReaderStore((state) => state.zoom);
  const goToPage = useReaderStore((state) => state.goToPage);
  const setTotalPages = useReaderStore((state) => state.setTotalPages);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: ReturnType<typeof import("pdfjs-dist")["getDocument"]> | null = null;

    (async () => {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

      const task = pdfjsLib.getDocument({ url: fileUrl });
      loadingTask = task;
      const loaded = await task.promise;
      if (cancelled) {
        task.destroy();
        return;
      }
      setTotalPages(loaded.numPages);
      const firstPage = await loaded.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1 });
      if (!cancelled) {
        setAspectRatio(viewport.width / viewport.height);
        setDoc(loaded);
      }
    })();

    return () => {
      cancelled = true;
      loadingTask?.destroy();
      setDoc(null);
    };
  }, [fileUrl, setTotalPages]);

  if (!doc || !totalPages) {
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
        <PdfFlipLeaf
          key={`${bookId}-${pageNumber}`}
          doc={doc}
          pageNumber={pageNumber}
          isNear={Math.abs(pageNumber - currentPage) <= NEAR_WINDOW}
        />
      ))}
    </FlipBook>
  );
}
