import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { ComicParserService } from './parsers/comic-parser.service';
import { EpubParserService } from './parsers/epub-parser.service';
import { FormatDetectorService } from './parsers/format-detector.service';
import { MobiParserService } from './parsers/mobi-parser.service';
import { PdfParserService } from './parsers/pdf-parser.service';
import { TxtParserService } from './parsers/txt-parser.service';

@Module({
  controllers: [BooksController],
  providers: [
    BooksService,
    FormatDetectorService,
    PdfParserService,
    EpubParserService,
    MobiParserService,
    ComicParserService,
    TxtParserService,
  ],
})
export class BooksModule {}
