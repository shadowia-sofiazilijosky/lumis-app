import { Injectable } from '@nestjs/common';
import { basename, extname } from 'node:path';
import { BookParser, ParsedBookMetadata } from './book-parser.interface';

const PALMDB_NAME_LENGTH = 32;

/**
 * MVP scope: only the title, read from the PalmDB header's 32-byte name
 * field. Richer metadata (author, etc.) lives in EXTH records deeper in the
 * file — parsing those is a project of its own and MOBI is fairly niche
 * post-AZW3, so it's not worth it for this pass.
 */
@Injectable()
export class MobiParserService implements BookParser {
  // eslint-disable-next-line @typescript-eslint/require-await
  async parse(
    buffer: Buffer,
    originalFilename: string,
  ): Promise<ParsedBookMetadata> {
    const rawName = buffer.subarray(0, PALMDB_NAME_LENGTH).toString('latin1');
    const title = rawName.replace(/\0.*$/s, '').trim();

    return {
      title: title || basename(originalFilename, extname(originalFilename)),
    };
  }
}
