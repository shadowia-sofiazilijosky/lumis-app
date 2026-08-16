import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Book, BookFormat } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';
import { BooksService } from './books.service';
import { ComicParserService } from './parsers/comic-parser.service';
import { EpubParserService } from './parsers/epub-parser.service';
import { FormatDetectorService } from './parsers/format-detector.service';
import { MobiParserService } from './parsers/mobi-parser.service';
import { PdfParserService } from './parsers/pdf-parser.service';
import { TxtParserService } from './parsers/txt-parser.service';

const mockBook: Book = {
  id: 'book-1',
  ownerId: 'user-1',
  title: 'Dune',
  author: 'Frank Herbert',
  format: BookFormat.EPUB,
  originalFileKey: 'user-1/book-1/original.epub',
  coverImageKey: 'user-1/book-1/cover.jpg',
  normalizedContentUrl: null,
  pageCount: 412,
  fileSizeBytes: 1024,
  metadata: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('BooksService', () => {
  let service: BooksService;
  let prisma: {
    book: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let storage: jest.Mocked<SupabaseStorageService>;
  let formatDetector: jest.Mocked<FormatDetectorService>;
  let epubParser: jest.Mocked<EpubParserService>;

  beforeEach(async () => {
    prisma = {
      book: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    storage = {
      upload: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
      createSignedUrl: jest
        .fn()
        .mockResolvedValue('https://signed.example/url'),
    } as unknown as jest.Mocked<SupabaseStorageService>;

    formatDetector = {
      detect: jest.fn().mockReturnValue(BookFormat.EPUB),
    } as unknown as jest.Mocked<FormatDetectorService>;

    epubParser = {
      parse: jest
        .fn()
        .mockResolvedValue({ title: 'Dune', author: 'Frank Herbert' }),
    } as unknown as jest.Mocked<EpubParserService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: PrismaService, useValue: prisma },
        { provide: SupabaseStorageService, useValue: storage },
        { provide: FormatDetectorService, useValue: formatDetector },
        { provide: PdfParserService, useValue: { parse: jest.fn() } },
        { provide: EpubParserService, useValue: epubParser },
        { provide: MobiParserService, useValue: { parse: jest.fn() } },
        { provide: ComicParserService, useValue: { parse: jest.fn() } },
        { provide: TxtParserService, useValue: { parse: jest.fn() } },
      ],
    }).compile();

    service = module.get(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('detects the format, uploads the file, and persists the book with parsed metadata', async () => {
      prisma.book.create.mockResolvedValue(mockBook);
      const file = {
        buffer: Buffer.from('fake-epub'),
        originalname: 'dune.epub',
      };

      const result = await service.upload('user-1', file, {});

      expect(formatDetector.detect).toHaveBeenCalledWith(file.buffer);
      expect(epubParser.parse).toHaveBeenCalledWith(file.buffer, 'dune.epub');
      expect(storage.upload).toHaveBeenCalledWith(
        expect.stringContaining('user-1/'),
        file.buffer,
        'application/epub+zip',
      );
      expect(prisma.book.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ownerId: 'user-1',
            title: 'Dune',
            author: 'Frank Herbert',
            format: BookFormat.EPUB,
          }),
        }),
      );
      expect(result.fileUrl).toBe('https://signed.example/url');
    });

    it('lets an explicit title/author in the DTO override the parsed metadata', async () => {
      prisma.book.create.mockResolvedValue(mockBook);
      const file = {
        buffer: Buffer.from('fake-epub'),
        originalname: 'dune.epub',
      };

      await service.upload('user-1', file, {
        title: 'Custom Title',
        author: 'Custom Author',
      });

      expect(prisma.book.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Custom Title',
            author: 'Custom Author',
          }),
        }),
      );
    });
  });

  describe('findOneForOwner', () => {
    it('throws NotFoundException if the book does not exist', async () => {
      prisma.book.findUnique.mockResolvedValue(null);

      await expect(
        service.findOneForOwner('user-1', 'missing'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException (not Forbidden) if the book belongs to someone else', async () => {
      prisma.book.findUnique.mockResolvedValue({
        ...mockBook,
        ownerId: 'someone-else',
      });

      await expect(service.findOneForOwner('user-1', 'book-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the book with signed URLs when owned', async () => {
      prisma.book.findUnique.mockResolvedValue(mockBook);

      const result = await service.findOneForOwner('user-1', 'book-1');

      expect(result.fileUrl).toBe('https://signed.example/url');
      expect(result.coverUrl).toBe('https://signed.example/url');
    });
  });

  describe('remove', () => {
    it('removes both storage keys and deletes the row when owned', async () => {
      prisma.book.findUnique.mockResolvedValue(mockBook);
      prisma.book.delete.mockResolvedValue(mockBook);

      await service.remove('user-1', 'book-1');

      expect(storage.remove).toHaveBeenCalledWith([
        mockBook.originalFileKey,
        mockBook.coverImageKey,
      ]);
      expect(prisma.book.delete).toHaveBeenCalledWith({
        where: { id: 'book-1' },
      });
    });

    it('throws NotFoundException and never touches storage if not owned', async () => {
      prisma.book.findUnique.mockResolvedValue({
        ...mockBook,
        ownerId: 'someone-else',
      });

      await expect(service.remove('user-1', 'book-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(storage.remove).not.toHaveBeenCalled();
      expect(prisma.book.delete).not.toHaveBeenCalled();
    });
  });
});
