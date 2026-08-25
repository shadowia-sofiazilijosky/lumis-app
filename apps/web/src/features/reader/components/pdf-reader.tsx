"use client";

import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import { useReaderStore } from "../store/reader-store";
import { PageFlip } from "./page-flip";
import { TextAnnotationLayer } from "./text-annotation-layer";

interface PdfReaderProps {
  bookId: string;
  fileUrl: string;
}

export function PdfReader({ bookId, fileUrl }: PdfReaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const [ready, setReady] = useState(false);
  const [renderTick, setRenderTick] = useState(0);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });

  const currentPage = useReaderStore((state) => state.currentPage);
  const flipDirection = useReaderStore((state) => state.flipDirection);
  const pageTurnMode = useReaderStore((state) => state.pageTurnMode);
  const zoom = useReaderStore((state) => state.zoom);
  const setTotalPages = useReaderStore((state) => state.setTotalPages);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

      const loadingTask = pdfjsLib.getDocument({ url: fileUrl });
      loadingTaskRef.current = loadingTask;
      const doc = await loadingTask.promise;
      if (cancelled) {
        loadingTask.destroy();
        return;
      }
      docRef.current = doc;
      setTotalPages(doc.numPages);
      setReady(true);
    })();

    return () => {
      cancelled = true;
      loadingTaskRef.current?.destroy();
      loadingTaskRef.current = null;
      docRef.current = null;
    };
  }, [fileUrl, setTotalPages]);

  useEffect(() => {
    if (!ready || !docRef.current || !canvasRef.current) return;
    let cancelled = false;
    const doc = docRef.current;

    (async () => {
      const page = await doc.getPage(Math.min(currentPage, doc.numPages));
      if (cancelled) return;

      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      const textLayerContainer = textLayerRef.current;
      if (!canvas || !context || !textLayerContainer) return;

      // Fit both dimensions at zoom=1 so the browser never has to CSS-shrink
      // the canvas afterwards — that would desync the text layer's
      // pixel-based positions (and highlight overlay rects) from the canvas.
      // Zoom then multiplies that fit scale and genuinely re-rasterizes the
      // page at the larger size (real resolution, not a CSS transform) —
      // same as a native PDF viewer — so the page overflows its container
      // and becomes scrollable/pannable instead of just clipped.
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
  }, [ready, currentPage, zoom]);

  return (
    <PageFlip flipKey={currentPage} direction={flipDirection} mode={pageTurnMode}>
      <div
        ref={frameRef}
        className="pdf-page-frame"
        style={{ width: frameSize.width || undefined, height: frameSize.height || undefined }}
      >
        <canvas ref={canvasRef} className="pdf-reader-canvas" />
        <div ref={textLayerRef} className="pdf-text-layer" />
        <TextAnnotationLayer
          bookId={bookId}
          pageIndex={currentPage - 1}
          containerRef={textLayerRef}
          refreshKey={`${currentPage}-${renderTick}`}
        />
      </div>
    </PageFlip>
  );
}
