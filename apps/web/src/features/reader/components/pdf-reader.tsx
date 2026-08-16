"use client";

import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import { useReaderStore } from "../store/reader-store";
import { PageFlip } from "./page-flip";

interface PdfReaderProps {
  fileUrl: string;
}

export function PdfReader({ fileUrl }: PdfReaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const docRef = useRef<PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const [ready, setReady] = useState(false);

  const currentPage = useReaderStore((state) => state.currentPage);
  const flipDirection = useReaderStore((state) => state.flipDirection);
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
      if (!canvas || !context) return;

      const containerWidth = canvas.parentElement?.clientWidth ?? 800;
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = containerWidth / baseViewport.width;
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport, canvas }).promise;
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, currentPage]);

  return (
    <PageFlip flipKey={currentPage} direction={flipDirection}>
      <canvas ref={canvasRef} className="pdf-reader-canvas" />
    </PageFlip>
  );
}
