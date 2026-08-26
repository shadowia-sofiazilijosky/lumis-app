"use client";

import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import { useReaderStore } from "../store/reader-store";
import { DrawingLayer } from "./drawing-layer";
import { PageFlip } from "./page-flip";
import { PdfFlipReader } from "./pdf-flip-reader";
import { TextAnnotationLayer } from "./text-annotation-layer";

interface PdfReaderProps {
  bookId: string;
  fileUrl: string;
}

interface PdfSinglePageProps {
  bookId: string;
  doc: PDFDocumentProxy;
  pageNumber: number;
  zoom: number;
}

/** Renders one PDF page (canvas + selectable text layer + annotation
 * layers) at the given page number -- used once for the normal single-page
 * view, twice side by side for the two-page spread view. */
function PdfSinglePage({ bookId, doc, pageNumber, zoom }: PdfSinglePageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const [renderTick, setRenderTick] = useState(0);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (pageNumber < 1 || pageNumber > doc.numPages) return;
    let cancelled = false;

    (async () => {
      const page = await doc.getPage(pageNumber);
      if (cancelled) return;

      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      const textLayerContainer = textLayerRef.current;
      if (!canvas || !context || !textLayerContainer) return;

      // Fit both dimensions at zoom=1 so the browser never has to CSS-shrink
      // the canvas afterwards — that would desync the text layer's
      // pixel-based positions (and highlight overlay rects) from the canvas.
      // Zoom then multiplies that fit scale and genuinely re-rasterizes the
      // page at the larger size (real resolution, not a CSS transform).
      const containerWidth = frameRef.current?.parentElement?.clientWidth ?? 800;
      const containerHeight = frameRef.current?.parentElement?.clientHeight ?? 1000;
      const baseViewport = page.getViewport({ scale: 1 });
      const fitScale = Math.min(
        containerWidth / baseViewport.width,
        containerHeight / baseViewport.height,
      );
      const viewport = page.getViewport({ scale: fitScale * zoom });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setFrameSize({ width: viewport.width, height: viewport.height });

      await page.render({ canvasContext: context, viewport, canvas }).promise;
      if (cancelled) return;

      textLayerContainer.replaceChildren();
      const pdfjsLib = await import("pdfjs-dist");
      const textLayer = new pdfjsLib.TextLayer({
        textContentSource: page.streamTextContent(),
        container: textLayerContainer,
        viewport,
      });
      await textLayer.render();
      if (!cancelled) setRenderTick((tick) => tick + 1);
    })();

    return () => {
      cancelled = true;
    };
  }, [doc, pageNumber, zoom]);

  if (pageNumber < 1 || pageNumber > doc.numPages) {
    return <div className="pdf-page-frame pdf-page-frame-empty" />;
  }

  return (
    <div
      ref={frameRef}
      className="pdf-page-frame"
      style={{ width: frameSize.width || undefined, height: frameSize.height || undefined }}
    >
      <canvas ref={canvasRef} className="pdf-reader-canvas" />
      <div ref={textLayerRef} className="pdf-text-layer" />
      <TextAnnotationLayer
        bookId={bookId}
        pageIndex={pageNumber - 1}
        containerRef={textLayerRef}
        refreshKey={`${pageNumber}-${renderTick}`}
      />
      <DrawingLayer
        bookId={bookId}
        pageIndex={pageNumber - 1}
        containerRef={frameRef}
        refreshKey={`${pageNumber}-${renderTick}`}
      />
    </div>
  );
}

export function PdfReader({ bookId, fileUrl }: PdfReaderProps) {
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);

  const currentPage = useReaderStore((state) => state.currentPage);
  const flipDirection = useReaderStore((state) => state.flipDirection);
  const pageTurnMode = useReaderStore((state) => state.pageTurnMode);
  const spreadView = useReaderStore((state) => state.spreadView);
  const zoom = useReaderStore((state) => state.zoom);
  const setTotalPages = useReaderStore((state) => state.setTotalPages);

  // "flip" mode hands the whole page off to PdfFlipReader (its own pdf.js
  // document, one canvas per leaf, real drag-to-curl) -- this single-page
  // pipeline is only needed for the other two page-turn modes.
  const singlePageMode = pageTurnMode !== "flip";

  useEffect(() => {
    if (!singlePageMode) return;
    let cancelled = false;

    (async () => {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

      const loadingTask = pdfjsLib.getDocument({ url: fileUrl });
      loadingTaskRef.current = loadingTask;
      const loaded = await loadingTask.promise;
      if (cancelled) {
        loadingTask.destroy();
        return;
      }
      docRef.current = loaded;
      setTotalPages(loaded.numPages);
      setDoc(loaded);
    })();

    return () => {
      cancelled = true;
      loadingTaskRef.current?.destroy();
      loadingTaskRef.current = null;
      docRef.current = null;
      setDoc(null);
    };
  }, [fileUrl, setTotalPages, singlePageMode]);

  if (!singlePageMode) {
    return <PdfFlipReader bookId={bookId} fileUrl={fileUrl} />;
  }

  if (!doc) return null;

  return (
    <PageFlip flipKey={currentPage} direction={flipDirection} mode={pageTurnMode}>
      <div className={spreadView ? "pdf-spread" : undefined}>
        <PdfSinglePage bookId={bookId} doc={doc} pageNumber={currentPage} zoom={zoom} />
        {spreadView && (
          <PdfSinglePage bookId={bookId} doc={doc} pageNumber={currentPage + 1} zoom={zoom} />
        )}
      </div>
    </PageFlip>
  );
}
