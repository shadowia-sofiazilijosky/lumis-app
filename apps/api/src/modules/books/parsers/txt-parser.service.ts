import { Injectable } from '@nestjs/common';
import { basename, extname } from 'node:path';
import { BookParser, ParsedBookMetadata } from './book-parser.interface';

@Injectable()
export class TxtParserService implements BookParser {
  // eslint-disable-next-line @typescript-eslint/require-await
  async parse(
    _buffer: Buffer,
    originalFilename: string,
  ): Promise<ParsedBookMetadata> {
    return { title: basename(originalFilename, extname(originalFilename)) };
  }
}
