import { Injectable } from '@nestjs/common';
import { basename, extname } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { BookParser, ParsedBookMetadata } from './book-parser.interface';

@Injectable()
export class PdfParserService implements BookParser {
  async parse(
    buffer: Buffer,
    originalFilename: string,
  ): Promise<ParsedBookMetadata> {
    const doc = await PDFDocument.load(buffer, {
      updateMetadata: false,
      ignoreEncryption: true,
    });

    return {
      title:
        doc.getTitle()?.trim() ||
        basename(originalFilename, extname(originalFilename)),
      author: doc.getAuthor()?.trim() || undefined,
      pageCount: doc.getPageCount(),
    };
  }
}
