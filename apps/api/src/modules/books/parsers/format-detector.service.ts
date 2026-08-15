import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { BookFormat } from '@prisma/client';
import AdmZip from 'adm-zip';
import { extname } from 'node:path';

const PDF_SIGNATURE = Buffer.from('%PDF-', 'ascii');
const ZIP_SIGNATURE = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const RAR_SIGNATURE = Buffer.from([0x52, 0x61, 0x72, 0x21, 0x1a, 0x07]); // "Rar!\x1A\x07"
const MOBI_SIGNATURE_OFFSET = 60;
const MOBI_SIGNATURE = Buffer.from('BOOKMOBI', 'ascii');

const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
]);

/**
 * Sniffs the actual format from the file's bytes — never trusts the
 * client-supplied filename/extension or mimetype for this decision.
 */
@Injectable()
export class FormatDetectorService {
  detect(buffer: Buffer): BookFormat {
    if (buffer.subarray(0, PDF_SIGNATURE.length).equals(PDF_SIGNATURE)) {
      return BookFormat.PDF;
    }

    if (
      buffer.length >= MOBI_SIGNATURE_OFFSET + MOBI_SIGNATURE.length &&
      buffer
        .subarray(
          MOBI_SIGNATURE_OFFSET,
          MOBI_SIGNATURE_OFFSET + MOBI_SIGNATURE.length,
        )
        .equals(MOBI_SIGNATURE)
    ) {
      return BookFormat.MOBI;
    }

    if (buffer.subarray(0, ZIP_SIGNATURE.length).equals(ZIP_SIGNATURE)) {
      return this.detectZipFormat(buffer);
    }

    if (buffer.subarray(0, RAR_SIGNATURE.length).equals(RAR_SIGNATURE)) {
      return BookFormat.CBR;
    }

    if (this.looksLikeText(buffer)) {
      return BookFormat.TXT;
    }

    throw new UnprocessableEntityException(
      'No pudimos identificar el formato del archivo. Formatos soportados: PDF, EPUB, MOBI, CBR, CBZ, TXT.',
    );
  }

  private detectZipFormat(buffer: Buffer): BookFormat {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    const mimetypeEntry = entries.find(
      (entry) => entry.entryName === 'mimetype',
    );
    if (
      mimetypeEntry &&
      zip.readAsText(mimetypeEntry).trim() === 'application/epub+zip'
    ) {
      return BookFormat.EPUB;
    }

    const fileEntries = entries.filter((entry) => !entry.isDirectory);
    const imageEntries = fileEntries.filter((entry) =>
      IMAGE_EXTENSIONS.has(extname(entry.entryName).toLowerCase()),
    );

    if (
      imageEntries.length > 0 &&
      imageEntries.length >= fileEntries.length * 0.5
    ) {
      return BookFormat.CBZ;
    }

    throw new UnprocessableEntityException(
      'El archivo ZIP no parece ser un EPUB ni un cómic (CBZ) válido.',
    );
  }

  private looksLikeText(buffer: Buffer): boolean {
    const sample = buffer.subarray(0, 8000);
    if (sample.includes(0)) return false; // null byte -> binary content

    try {
      new TextDecoder('utf-8', { fatal: true }).decode(sample);
      return true;
    } catch {
      return false;
    }
  }
}
