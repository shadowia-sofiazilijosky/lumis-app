import { Injectable, NotFoundException } from '@nestjs/common';
import { Book, BookFormat, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { PrismaService } from '../../database/prisma.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import {
  BookParser,
  ParsedBookMetadata,
} from './parsers/book-parser.interface';
import { ComicParserService } from './parsers/comic-parser.service';
import { EpubParserService } from './parsers/epub-parser.service';
import { FormatDetectorService } from './parsers/format-detector.service';
import { MobiParserService } from './parsers/mobi-parser.service';
import { PdfParserService } from './parsers/pdf-parser.service';
import { TxtParserService } from './parsers/txt-parser.service';

export interface UploadedBookFile {
  buffer: Buffer;
  originalname: string;
}

export interface BookWithSignedUrls extends Book {
  fileUrl: string | null;
  coverUrl: string | null;
}

const DEFAULT_EXTENSION: Record<BookFormat, string> = {
  PDF: '.pdf',
  EPUB: '.epub',
  MOBI: '.mobi',
  CBR: '.cbr',
  CBZ: '.cbz',
  TXT: '.txt',
};

const ORIGINAL_CONTENT_TYPE: Record<BookFormat, string> = {
  PDF: 'application/pdf',
  EPUB: 'application/epub+zip',
  MOBI: 'application/x-mobipocket-ebook',
  CBR: 'application/x-cbr',
  CBZ: 'application/x-cbz',
  TXT: 'text/plain',
};

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/bmp': '.bmp',
};

@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: SupabaseStorageService,
    private readonly formatDetector: FormatDetectorService,
    private readonly pdfParser: PdfParserService,
    private readonly epubParser: EpubParserService,
    private readonly mobiParser: MobiParserService,
    private readonly comicParser: ComicParserService,
    private readonly txtParser: TxtParserService,
  ) {}

  async upload(
    ownerId: string,
    file: UploadedBookFile,
    dto: CreateBookDto,
  ): Promise<BookWithSignedUrls> {
    const format = this.formatDetector.detect(file.buffer);
    const parsed = await this.parseByFormat(format, file);

    const bookId = randomUUID();
    const originalExtension =
      extname(file.originalname) || DEFAULT_EXTENSION[format];
    const originalFileKey = `${ownerId}/${bookId}/original${originalExtension}`;

    await this.storage.upload(
      originalFileKey,
      file.buffer,
      ORIGINAL_CONTENT_TYPE[format],
    );

    let coverImageKey: string | null = null;
    if (parsed.coverBuffer && parsed.coverContentType) {
      const coverExtension =
        EXTENSION_BY_CONTENT_TYPE[parsed.coverContentType] ?? '';
      coverImageKey = `${ownerId}/${bookId}/cover${coverExtension}`;
      await this.storage.upload(
        coverImageKey,
        parsed.coverBuffer,
        parsed.coverContentType,
      );
    }

    const book = await this.prisma.book.create({
      data: {
        id: bookId,
        ownerId,
        title: dto.title?.trim() || parsed.title,
        author: dto.author?.trim() || parsed.author,
        format,
        originalFileKey,
        coverImageKey,
        pageCount: parsed.pageCount,
        fileSizeBytes: file.buffer.byteLength,
        metadata: parsed.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    return this.withSignedUrls(book);
  }

  async findAllForOwner(
    ownerId: string,
    skip = 0,
    take = 20,
  ): Promise<BookWithSignedUrls[]> {
    const books = await this.prisma.book.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    return Promise.all(books.map((book) => this.withSignedUrls(book)));
  }

  async findOneForOwner(
    ownerId: string,
    id: string,
  ): Promise<BookWithSignedUrls> {
    const book = await this.getOwnedBookOrThrow(ownerId, id);
    return this.withSignedUrls(book);
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateBookDto,
  ): Promise<BookWithSignedUrls> {
    await this.getOwnedBookOrThrow(ownerId, id);

    const book = await this.prisma.book.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.author !== undefined && { author: dto.author.trim() }),
      },
    });

    return this.withSignedUrls(book);
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const book = await this.getOwnedBookOrThrow(ownerId, id);
    const keysToRemove = [book.originalFileKey, book.coverImageKey].filter(
      (key): key is string => !!key,
    );

    await this.storage.remove(keysToRemove);
    await this.prisma.book.delete({ where: { id } });
  }

  private async getOwnedBookOrThrow(
    ownerId: string,
    id: string,
  ): Promise<Book> {
    const book = await this.prisma.book.findUnique({ where: { id } });

    // 404 either way — a book that exists but belongs to someone else
    // shouldn't be distinguishable from one that doesn't exist at all.
    if (!book || book.ownerId !== ownerId) {
      throw new NotFoundException('Libro no encontrado.');
    }

    return book;
  }

  private async withSignedUrls(book: Book): Promise<BookWithSignedUrls> {
    const [fileUrl, coverUrl] = await Promise.all([
      this.storage.createSignedUrl(book.originalFileKey),
      book.coverImageKey
        ? this.storage.createSignedUrl(book.coverImageKey)
        : Promise.resolve(null),
    ]);

    return { ...book, fileUrl, coverUrl };
  }

  private parseByFormat(
    format: BookFormat,
    file: UploadedBookFile,
  ): Promise<ParsedBookMetadata> {
    if (format === BookFormat.CBR || format === BookFormat.CBZ) {
      return this.comicParser.parse(file.buffer, file.originalname, format);
    }

    const parsers: Partial<Record<BookFormat, BookParser>> = {
      [BookFormat.PDF]: this.pdfParser,
      [BookFormat.EPUB]: this.epubParser,
      [BookFormat.MOBI]: this.mobiParser,
      [BookFormat.TXT]: this.txtParser,
    };

    return parsers[format]!.parse(file.buffer, file.originalname);
  }
}
