import { Injectable, NotFoundException } from '@nestjs/common';
import { Book, Highlight, Note } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

export interface NotesOverviewBook {
  book: {
    id: string;
    title: string;
    author: string | null;
    coverUrl: string | null;
  };
  notes: Note[];
  highlights: Highlight[];
  lastActivityAt: Date;
}

export interface NotesOverview {
  books: NotesOverviewBook[];
  totalNotes: number;
  totalHighlights: number;
  booksWithNotes: number;
}

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: SupabaseStorageService,
  ) {}

  async findAllForBook(ownerId: string, bookId: string): Promise<Note[]> {
    await this.getOwnedBookOrThrow(ownerId, bookId);

    return this.prisma.note.findMany({
      where: { bookId, userId: ownerId },
      orderBy: [{ pageIndex: 'asc' }, { offset: 'asc' }],
    });
  }

  async create(
    ownerId: string,
    bookId: string,
    dto: CreateNoteDto,
  ): Promise<Note> {
    await this.getOwnedBookOrThrow(ownerId, bookId);

    if (dto.highlightId) {
      const highlight = await this.prisma.highlight.findUnique({
        where: { id: dto.highlightId },
      });
      if (
        !highlight ||
        highlight.userId !== ownerId ||
        highlight.bookId !== bookId
      ) {
        throw new NotFoundException('Resaltado no encontrado.');
      }
    }

    return this.prisma.note.create({
      data: {
        userId: ownerId,
        bookId,
        highlightId: dto.highlightId,
        pageIndex: dto.pageIndex,
        offset: dto.offset,
        body: dto.body,
        colorTag: dto.colorTag,
        cfi: dto.cfi,
      },
    });
  }

  async update(
    ownerId: string,
    bookId: string,
    noteId: string,
    dto: UpdateNoteDto,
  ): Promise<Note> {
    await this.getOwnedNoteOrThrow(ownerId, bookId, noteId);

    // At most one pinned note/highlight per book -- pinning this one unpins
    // every other note *and* highlight on the same book first (mirrored in
    // HighlightsService.update for the other direction).
    if (dto.pinned === true) {
      await this.prisma.$transaction([
        this.prisma.note.updateMany({
          where: { bookId, userId: ownerId, pinned: true },
          data: { pinned: false },
        }),
        this.prisma.highlight.updateMany({
          where: { bookId, userId: ownerId, pinned: true },
          data: { pinned: false },
        }),
      ]);
    }

    return this.prisma.note.update({
      where: { id: noteId },
      data: {
        ...(dto.body !== undefined && { body: dto.body }),
        ...(dto.colorTag !== undefined && { colorTag: dto.colorTag }),
        ...(dto.pinned !== undefined && { pinned: dto.pinned }),
      },
    });
  }

  async remove(ownerId: string, bookId: string, noteId: string): Promise<void> {
    await this.getOwnedNoteOrThrow(ownerId, bookId, noteId);
    await this.prisma.note.delete({ where: { id: noteId } });
  }

  /** Aggregates every note/highlight the user has, grouped by book, for the
   * top-level Notas list page -- one query pass instead of the reader's
   * usual per-book fetches. */
  async findOverviewForOwner(ownerId: string): Promise<NotesOverview> {
    const [notes, highlights] = await Promise.all([
      this.prisma.note.findMany({
        where: { userId: ownerId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.highlight.findMany({
        where: { userId: ownerId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const bookIds = Array.from(
      new Set([...notes.map((n) => n.bookId), ...highlights.map((h) => h.bookId)]),
    );

    if (bookIds.length === 0) {
      return { books: [], totalNotes: 0, totalHighlights: 0, booksWithNotes: 0 };
    }

    const books = await this.prisma.book.findMany({
      where: { id: { in: bookIds } },
      select: { id: true, title: true, author: true, coverImageKey: true },
    });
    const bookById = new Map(books.map((book) => [book.id, book]));

    const groups = await Promise.all(
      bookIds
        .map((bookId) => {
          const book = bookById.get(bookId);
          if (!book) return null;

          const bookNotes = notes.filter((n) => n.bookId === bookId);
          const bookHighlights = highlights.filter((h) => h.bookId === bookId);
          const lastActivityMs = Math.max(
            ...bookNotes.map((n) => n.updatedAt.getTime()),
            ...bookHighlights.map((h) => h.createdAt.getTime()),
          );

          return { book, bookNotes, bookHighlights, lastActivityMs };
        })
        .filter((group): group is NonNullable<typeof group> => group !== null)
        .sort((a, b) => b.lastActivityMs - a.lastActivityMs)
        .map(async ({ book, bookNotes, bookHighlights, lastActivityMs }) => ({
          book: {
            id: book.id,
            title: book.title,
            author: book.author,
            coverUrl: book.coverImageKey
              ? await this.storage.createSignedUrl(book.coverImageKey)
              : null,
          },
          notes: bookNotes,
          highlights: bookHighlights,
          lastActivityAt: new Date(lastActivityMs),
        })),
    );

    return {
      books: groups,
      totalNotes: notes.length,
      totalHighlights: highlights.length,
      booksWithNotes: bookIds.length,
    };
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

  private async getOwnedNoteOrThrow(
    ownerId: string,
    bookId: string,
    noteId: string,
  ): Promise<Note> {
    const note = await this.prisma.note.findUnique({ where: { id: noteId } });

    if (!note || note.userId !== ownerId || note.bookId !== bookId) {
      throw new NotFoundException('Nota no encontrada.');
    }

    return note;
  }
}
