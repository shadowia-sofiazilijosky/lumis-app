import { Injectable, NotFoundException } from '@nestjs/common';
import { Book, Note } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.note.update({
      where: { id: noteId },
      data: {
        ...(dto.body !== undefined && { body: dto.body }),
        ...(dto.colorTag !== undefined && { colorTag: dto.colorTag }),
      },
    });
  }

  async remove(ownerId: string, bookId: string, noteId: string): Promise<void> {
    await this.getOwnedNoteOrThrow(ownerId, bookId, noteId);
    await this.prisma.note.delete({ where: { id: noteId } });
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
