import { Injectable, Logger } from '@nestjs/common';
import { createCanvas } from '@napi-rs/canvas';
import { basename, extname } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { BookParser, ParsedBookMetadata } from './book-parser.interface';

const COVER_MAX_WIDTH = 400;

@Injectable()
export class PdfParserService implements BookParser {
  private readonly logger = new Logger(PdfParserService.name);

  async parse(
    buffer: Buffer,
    originalFilename: string,
  ): Promise<ParsedBookMetadata> {
    const doc = await PDFDocument.load(buffer, {
      updateMetadata: false,
      ignoreEncryption: true,
    });

    const cover = await this.renderCover(buffer).catch((error: Error) => {
      // A thumbnail is a nice-to-have — never fail the whole upload over it.
      this.logger.warn(`No se pudo generar la portada del PDF: ${error.message}`);
      return null;
    });

    return {
      title:
        doc.getTitle()?.trim() ||
        basename(originalFilename, extname(originalFilename)),
      author: doc.getAuthor()?.trim() || undefined,
      pageCount: doc.getPageCount(),
      coverBuffer: cover?.buffer,
      coverContentType: cover ? 'image/jpeg' : undefined,
    };
  }

  private async renderCover(
    buffer: Buffer,
  ): Promise<{ buffer: Buffer } | null> {
    // pdfjs-dist's legacy Node build renders like the browser build, but
    // without a Worker/DOM — Canvas2D-compatible context is all it needs.
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
    });

    try {
      const doc = await loadingTask.promise;
      const page = await doc.getPage(1);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = COVER_MAX_WIDTH / baseViewport.width;
      const viewport = page.getViewport({ scale });

      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');

      await page.render({
        canvasContext: context as unknown as CanvasRenderingContext2D,
        canvas: canvas as unknown as HTMLCanvasElement,
        viewport,
      }).promise;

      return { buffer: canvas.toBuffer('image/jpeg', 0.85) };
    } finally {
      await loadingTask.destroy();
    }
  }
}
