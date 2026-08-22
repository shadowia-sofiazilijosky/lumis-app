import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Book, BookFormat, Shelf, ShelfArrangement } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';
import { ShelvesService } from './shelves.service';

const mockShelf: Shelf = {
  id: 'shelf-1',
  ownerId: 'user-1',
  name: 'Fantasía',
  genre: 'fantasy',
  arrangement: ShelfArrangement.SPINE,
  shelfColor: '#8C2F39',
  shelfFrame: null,
  backgroundColor: '#F7E6E6',
  backgroundImageUrl: null,
  decorations: [],
  spotifyPlaylistId: null,
  spotifyPlaylistUrl: null,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

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

describe('ShelvesService', () => {
  let service: ShelvesService;
  let prisma: {
    shelf: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    book: { findUnique: jest.Mock };
    bookShelf: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      delete: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let storage: jest.Mocked<SupabaseStorageService>;

  beforeEach(async () => {
    prisma = {
      shelf: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      book: { findUnique: jest.fn() },
      bookShelf: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((ops: unknown[]) => Promise.all(ops)),
    };

    storage = {
      createSignedUrl: jest
        .fn()
        .mockResolvedValue('https://signed.example/cover.jpg'),
    } as unknown as jest.Mocked<SupabaseStorageService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShelvesService,
        { provide: PrismaService, useValue: prisma },
        { provide: SupabaseStorageService, useValue: storage },
      ],
    }).compile();

    service = module.get(ShelvesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOneForOwner', () => {
    it('throws NotFoundException if the shelf is not owned', async () => {
      prisma.shelf.findUnique.mockResolvedValue({
        ...mockShelf,
        ownerId: 'someone-else',
      });

      await expect(
        service.findOneForOwner('user-1', 'shelf-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns the shelf with books and resolved cover URLs', async () => {
      prisma.shelf.findUnique.mockResolvedValue(mockShelf);
      prisma.bookShelf.findMany.mockResolvedValue([
        {
          bookId: 'book-1',
          shelfId: 'shelf-1',
          position: { x: 10, y: 20 },
          addedAt: new Date(),
          book: {
            id: 'book-1',
            title: 'Dune',
            author: 'Frank Herbert',
            format: BookFormat.EPUB,
            pageCount: 412,
            coverImageKey: 'user-1/book-1/cover.jpg',
          },
        },
      ]);

      const result = await service.findOneForOwner('user-1', 'shelf-1');

      expect(result.books).toHaveLength(1);
      expect(result.books[0].book.coverUrl).toBe(
        'https://signed.example/cover.jpg',
      );
      expect(storage.createSignedUrl).toHaveBeenCalledWith(
        'user-1/book-1/cover.jpg',
      );
    });
  });

  describe('addBook', () => {
    beforeEach(() => {
      prisma.shelf.findUnique.mockResolvedValue(mockShelf);
      prisma.book.findUnique.mockResolvedValue(mockBook);
    });

    it('throws NotFoundException if the book is not owned', async () => {
      prisma.book.findUnique.mockResolvedValue({
        ...mockBook,
        ownerId: 'someone-else',
      });

      await expect(
        service.addBook('user-1', 'shelf-1', { bookId: 'book-1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException if the book is already on the shelf', async () => {
      prisma.bookShelf.findUnique.mockResolvedValue({
        bookId: 'book-1',
        shelfId: 'shelf-1',
      });

      await expect(
        service.addBook('user-1', 'shelf-1', { bookId: 'book-1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates the BookShelf row when everything checks out', async () => {
      prisma.bookShelf.findUnique.mockResolvedValue(null);

      await service.addBook('user-1', 'shelf-1', {
        bookId: 'book-1',
        position: { x: 5, y: 5 },
      });

      expect(prisma.bookShelf.create).toHaveBeenCalledWith({
        data: {
          bookId: 'book-1',
          shelfId: 'shelf-1',
          position: { x: 5, y: 5 },
        },
      });
    });
  });

  describe('removeBook', () => {
    it('throws NotFoundException if the book is not on the shelf', async () => {
      prisma.shelf.findUnique.mockResolvedValue(mockShelf);
      prisma.bookShelf.findUnique.mockResolvedValue(null);

      await expect(
        service.removeBook('user-1', 'shelf-1', 'book-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateLayout', () => {
    it('throws ConflictException if a bookId is not currently on the shelf', async () => {
      prisma.shelf.findUnique.mockResolvedValue(mockShelf);
      prisma.bookShelf.findMany.mockResolvedValue([{ bookId: 'book-1' }]);

      await expect(
        service.updateLayout('user-1', 'shelf-1', {
          positions: [{ bookId: 'book-2', position: { x: 1, y: 1 } }],
        }),
      ).rejects.toThrow(ConflictException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('updates every position in a single transaction', async () => {
      prisma.shelf.findUnique.mockResolvedValue(mockShelf);
      prisma.bookShelf.findMany.mockResolvedValue([
        { bookId: 'book-1' },
        { bookId: 'book-2' },
      ]);
      prisma.bookShelf.update.mockResolvedValue({});

      await service.updateLayout('user-1', 'shelf-1', {
        positions: [
          { bookId: 'book-1', position: { x: 1, y: 1 } },
          { bookId: 'book-2', position: { x: 2, y: 2 } },
        ],
      });

      expect(prisma.bookShelf.update).toHaveBeenCalledTimes(2);
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
