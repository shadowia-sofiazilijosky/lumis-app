import { Injectable } from '@nestjs/common';
import { basename, extname } from 'node:path';
import { paginateText } from '../../../common/text-pagination';
import { BookParser, ParsedBookMetadata } from './book-parser.interface';

@Injectable()
export class TxtParserService implements BookParser {
  // eslint-disable-next-line @typescript-eslint/require-await
  async parse(
    buffer: Buffer,
    originalFilename: string,
  ): Promise<ParsedBookMetadata> {
    const pageCount = paginateText(buffer.toString('utf-8')).length;

    return {
      title: basename(originalFilename, extname(originalFilename)),
      pageCount,
    };
  }
}
