import { Injectable, NotFoundException } from '@nestjs/common';
import { Book, BookFormat } from '@prisma/client';
import { extname } from 'node:path';
import { paginateText } from '../../common/text-pagination';
import { PrismaService } from '../../database/prisma.service';
import {
  RarComicArchiveReader,
  ZipComicArchiveReader,
  listComicPageNames,
  type ComicArchiveReader,
} from '../books/parsers/comic-archive-reader';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';

const IMAGE_CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
};

export interface ImagePageResult {
  kind: 'image';
  buffer: Buffer;
  contentType: string;
}

export interface TextPageResult {
  kind: 'text';
  pageNumber: number;
  totalPages: number;
  text: string;
}

export type ReaderPageResult = ImagePageResult | TextPageResult;

const BACKEND_PAGINATED_FORMATS = new Set<BookFormat>([
  BookFormat.CBR,
  BookFormat.CBZ,
  BookFormat.TXT,
]);

@Injectable()
export class ReaderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: SupabaseStorageService,
  ) {}

  /** Whether this format is served through this module (vs. rendered client-side from the original file). */
  static isBackendPaginated(format: BookFormat): boolean {
    return BACKEND_PAGINATED_FORMATS.has(format);
  }

  async getPage(
    ownerId: string,
    bookId: string,
    pageNumber: number,
  ): Promise<ReaderPageResult> {
    const book = await this.getOwnedBookOrThrow(ownerId, bookId);

    switch (book.format) {
      case BookFormat.CBZ:
      case BookFormat.CBR:
        return this.getComicPage(book, pageNumber);
      case BookFormat.TXT:
        return this.getTextPage(book, pageNumber);
      default:
        throw new NotFoundException(
          `El formato ${book.format} no usa paginación del backend — se lee directo del archivo original.`,
        );
    }
  }

  private async getComicPage(
    book: Book,
    pageNumber: number,
  ): Promise<ImagePageResult> {
    const buffer = await this.storage.download(book.originalFileKey);
    const reader: ComicArchiveReader =
      book.format === BookFormat.CBZ
        ? new ZipComicArchiveReader(buffer)
        : await RarComicArchiveReader.create(buffer);

    const pageNames = listComicPageNames(reader);
    const name = pageNames[pageNumber - 1];
    if (!name) {
      throw new NotFoundException('Página no encontrada.');
    }

    const pageBuffer = reader.readEntry(name);
    if (!pageBuffer) {
      throw new NotFoundException('Página no encontrada.');
    }

    return {
      kind: 'image',
      buffer: pageBuffer,
      contentType:
        IMAGE_CONTENT_TYPES[extname(name).toLowerCase()] ??
        'application/octet-stream',
    };
  }

  private async getTextPage(
    book: Book,
    pageNumber: number,
  ): Promise<TextPageResult> {
    const buffer = await this.storage.download(book.originalFileKey);
    const pages = paginateText(buffer.toString('utf-8'));
    const text = pages[pageNumber - 1];

    if (text === undefined) {
      throw new NotFoundException('Página no encontrada.');
    }

    return { kind: 'text', pageNumber, totalPages: pages.length, text };
  }

  private async getOwnedBookOrThrow(
    ownerId: string,
    bookId: string,
  ): Promise<Book> {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });

    if (!book || book.ownerId !== ownerId) {
      throw new NotFoundException('Libro no encontrado.');
    }

    return book;
  }
}
