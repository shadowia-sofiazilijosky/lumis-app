import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Book, Prisma, Shelf } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';
import { AddBookToShelfDto } from './dto/add-book-to-shelf.dto';
import { CreateShelfDto } from './dto/create-shelf.dto';
import { UpdateShelfDto } from './dto/update-shelf.dto';
import { UpdateShelfLayoutDto } from './dto/update-shelf-layout.dto';

type BookSummary = Pick<
  Book,
  'id' | 'title' | 'author' | 'format' | 'pageCount' | 'coverImageKey'
>;

const PREVIEW_COVER_LIMIT = 6;

export interface ShelfListItem extends Shelf {
  bookCount: number;
  previewCovers: string[];
}

export interface ShelfBookEntry {
  bookId: string;
  position: Prisma.JsonValue;
  addedAt: Date;
  book: BookSummary & { coverUrl: string | null };
}

export interface ShelfWithBooks extends Shelf {
  books: ShelfBookEntry[];
}

const BOOK_SUMMARY_SELECT = {
  id: true,
  title: true,
  author: true,
  format: true,
  pageCount: true,
  coverImageKey: true,
} satisfies Prisma.BookSelect;

@Injectable()
export class ShelvesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: SupabaseStorageService,
  ) {}

  async create(ownerId: string, dto: CreateShelfDto): Promise<Shelf> {
    return this.prisma.shelf.create({
      data: {
        ownerId,
        name: dto.name.trim(),
        genre: dto.genre?.trim(),
        arrangement: dto.arrangement,
        shelfColor: dto.shelfColor,
        shelfFrame: dto.shelfFrame,
        backgroundColor: dto.backgroundColor,
        backgroundImageUrl: dto.backgroundImageUrl,
        canvasWidth: dto.canvasWidth,
        canvasHeight: dto.canvasHeight,
        decorations: dto.decorations as Prisma.InputJsonValue | undefined,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async findAllForOwner(ownerId: string): Promise<ShelfListItem[]> {
    const shelves = await this.prisma.shelf.findMany({
      where: { ownerId },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { books: true } },
        books: {
          take: PREVIEW_COVER_LIMIT,
          select: { book: { select: { coverImageKey: true } } },
        },
      },
    });

    return Promise.all(
      shelves.map(async ({ _count, books, ...shelf }) => {
        const previewCovers = (
          await Promise.all(
            books.map(({ book }) =>
              book.coverImageKey
                ? this.storage.createSignedUrl(book.coverImageKey)
                : Promise.resolve(null),
            ),
          )
        ).filter((url): url is string => url !== null);

        return { ...shelf, bookCount: _count.books, previewCovers };
      }),
    );
  }

  async findOneForOwner(ownerId: string, id: string): Promise<ShelfWithBooks> {
    const shelf = await this.getOwnedShelfOrThrow(ownerId, id);

    const bookShelves = await this.prisma.bookShelf.findMany({
      where: { shelfId: id },
      include: { book: { select: BOOK_SUMMARY_SELECT } },
    });

    const books = await Promise.all(
      bookShelves.map(async (bookShelf) => ({
        bookId: bookShelf.bookId,
        position: await this.resolvePositionImage(bookShelf.position),
        addedAt: bookShelf.addedAt,
        book: {
          ...bookShelf.book,
          coverUrl: bookShelf.book.coverImageKey
            ? await this.storage.createSignedUrl(bookShelf.book.coverImageKey)
            : null,
        },
      })),
    );

    return { ...shelf, books };
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateShelfDto,
  ): Promise<Shelf> {
    await this.getOwnedShelfOrThrow(ownerId, id);

    return this.prisma.shelf.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.genre !== undefined && { genre: dto.genre.trim() }),
        ...(dto.arrangement !== undefined && { arrangement: dto.arrangement }),
        ...(dto.shelfColor !== undefined && { shelfColor: dto.shelfColor }),
        ...(dto.shelfFrame !== undefined && { shelfFrame: dto.shelfFrame }),
        ...(dto.backgroundColor !== undefined && {
          backgroundColor: dto.backgroundColor,
        }),
        ...(dto.backgroundImageUrl !== undefined && {
          backgroundImageUrl: dto.backgroundImageUrl,
        }),
        ...(dto.canvasWidth !== undefined && { canvasWidth: dto.canvasWidth }),
        ...(dto.canvasHeight !== undefined && {
          canvasHeight: dto.canvasHeight,
        }),
        ...(dto.decorations !== undefined && {
          decorations: dto.decorations as Prisma.InputJsonValue,
        }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async remove(ownerId: string, id: string): Promise<void> {
    await this.getOwnedShelfOrThrow(ownerId, id);
    // BookShelf rows cascade-delete with the shelf; the books themselves are untouched.
    await this.prisma.shelf.delete({ where: { id } });
  }

  async addBook(
    ownerId: string,
    shelfId: string,
    dto: AddBookToShelfDto,
  ): Promise<void> {
    await this.getOwnedShelfOrThrow(ownerId, shelfId);
    await this.getOwnedBookOrThrow(ownerId, dto.bookId);

    const existing = await this.prisma.bookShelf.findUnique({
      where: { bookId_shelfId: { bookId: dto.bookId, shelfId } },
    });
    if (existing) {
      throw new ConflictException('El libro ya está en esta estantería.');
    }

    await this.prisma.bookShelf.create({
      data: {
        bookId: dto.bookId,
        shelfId,
        position: dto.position as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async removeBook(
    ownerId: string,
    shelfId: string,
    bookId: string,
  ): Promise<void> {
    await this.getOwnedShelfOrThrow(ownerId, shelfId);

    const existing = await this.prisma.bookShelf.findUnique({
      where: { bookId_shelfId: { bookId, shelfId } },
    });
    if (!existing) {
      throw new NotFoundException('Ese libro no está en esta estantería.');
    }

    await this.prisma.bookShelf.delete({
      where: { bookId_shelfId: { bookId, shelfId } },
    });
  }

  async updateLayout(
    ownerId: string,
    shelfId: string,
    dto: UpdateShelfLayoutDto,
  ): Promise<void> {
    await this.getOwnedShelfOrThrow(ownerId, shelfId);

    const currentEntries = await this.prisma.bookShelf.findMany({
      where: { shelfId },
      select: { bookId: true },
    });
    const currentBookIds = new Set(currentEntries.map((entry) => entry.bookId));

    const unknownBookIds = dto.positions
      .map((entry) => entry.bookId)
      .filter((bookId) => !currentBookIds.has(bookId));
    if (unknownBookIds.length > 0) {
      throw new ConflictException(
        `Estos libros no están en la estantería: ${unknownBookIds.join(', ')}.`,
      );
    }

    await this.prisma.$transaction(
      dto.positions.map((entry) =>
        this.prisma.bookShelf.update({
          where: { bookId_shelfId: { bookId: entry.bookId, shelfId } },
          data: {
            position: entry.position as unknown as Prisma.InputJsonValue,
          },
        }),
      ),
    );
  }

  async uploadSpineImage(
    ownerId: string,
    shelfId: string,
    bookId: string,
    file: { buffer: Buffer; mimetype: string },
  ): Promise<{
    customSpineImageKey: string;
    customSpineImageUrl: string | null;
  }> {
    await this.getOwnedShelfOrThrow(ownerId, shelfId);

    const bookShelf = await this.prisma.bookShelf.findUnique({
      where: { bookId_shelfId: { bookId, shelfId } },
    });
    if (!bookShelf) {
      throw new NotFoundException('Ese libro no está en esta estantería.');
    }

    const extension = file.mimetype === 'image/png' ? '.png' : '.jpg';
    const customSpineImageKey = `${ownerId}/${shelfId}/${bookId}/spine-custom${extension}`;
    await this.storage.upload(customSpineImageKey, file.buffer, file.mimetype);

    const currentPosition =
      bookShelf.position && typeof bookShelf.position === 'object'
        ? (bookShelf.position as Record<string, unknown>)
        : {};
    await this.prisma.bookShelf.update({
      where: { bookId_shelfId: { bookId, shelfId } },
      data: {
        position: {
          ...currentPosition,
          customSpineImageKey,
        },
      },
    });

    return {
      customSpineImageKey,
      customSpineImageUrl:
        await this.storage.createSignedUrl(customSpineImageKey),
    };
  }

  private async resolvePositionImage(
    position: Prisma.JsonValue,
  ): Promise<Prisma.JsonValue> {
    if (!position || typeof position !== 'object' || Array.isArray(position)) {
      return position;
    }
    const key = (position as Record<string, unknown>).customSpineImageKey;
    if (typeof key !== 'string') return position;

    return {
      ...position,
      customSpineImageUrl: await this.storage.createSignedUrl(key),
    };
  }

  private async getOwnedShelfOrThrow(
    ownerId: string,
    id: string,
  ): Promise<Shelf> {
    const shelf = await this.prisma.shelf.findUnique({ where: { id } });

    if (!shelf || shelf.ownerId !== ownerId) {
      throw new NotFoundException('Estantería no encontrada.');
    }

    return shelf;
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
