import { Injectable, NotFoundException } from '@nestjs/common';
import { Book, Highlight } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateHighlightDto } from './dto/create-highlight.dto';
import { UpdateHighlightDto } from './dto/update-highlight.dto';

@Injectable()
export class HighlightsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForBook(ownerId: string, bookId: string): Promise<Highlight[]> {
    await this.getOwnedBookOrThrow(ownerId, bookId);

    return this.prisma.highlight.findMany({
      where: { bookId, userId: ownerId },
      orderBy: [{ pageIndex: 'asc' }, { startOffset: 'asc' }],
    });
  }

  async create(
    ownerId: string,
    bookId: string,
    dto: CreateHighlightDto,
  ): Promise<Highlight> {
    await this.getOwnedBookOrThrow(ownerId, bookId);

    return this.prisma.highlight.create({
      data: {
        userId: ownerId,
        bookId,
        color: dto.color,
        size: dto.size ?? 'normal',
        pageIndex: dto.pageIndex,
        startOffset: dto.startOffset,
        endOffset: dto.endOffset,
        selectedText: dto.selectedText,
        cfi: dto.cfi,
      },
    });
  }

  async update(
    ownerId: string,
    bookId: string,
    highlightId: string,
    dto: UpdateHighlightDto,
  ): Promise<Highlight> {
    await this.getOwnedHighlightOrThrow(ownerId, bookId, highlightId);

    // At most one pinned note/highlight per book -- pinning this one unpins
    // every other note *and* highlight on the same book first.
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

    return this.prisma.highlight.update({
      where: { id: highlightId },
      data: {
        ...(dto.pinned !== undefined && { pinned: dto.pinned }),
      },
    });
  }

  async remove(
    ownerId: string,
    bookId: string,
    highlightId: string,
  ): Promise<void> {
    await this.getOwnedHighlightOrThrow(ownerId, bookId, highlightId);
    await this.prisma.highlight.delete({ where: { id: highlightId } });
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

  private async getOwnedHighlightOrThrow(
    ownerId: string,
    bookId: string,
    highlightId: string,
  ): Promise<Highlight> {
    const highlight = await this.prisma.highlight.findUnique({
      where: { id: highlightId },
    });

    if (
      !highlight ||
      highlight.userId !== ownerId ||
      highlight.bookId !== bookId
    ) {
      throw new NotFoundException('Resaltado no encontrado.');
    }

    return highlight;
  }
}
