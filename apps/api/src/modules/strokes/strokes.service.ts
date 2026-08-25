import { Injectable, NotFoundException } from '@nestjs/common';
import { Book, Stroke } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateStrokeDto } from './dto/create-stroke.dto';

@Injectable()
export class StrokesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForBook(ownerId: string, bookId: string): Promise<Stroke[]> {
    await this.getOwnedBookOrThrow(ownerId, bookId);

    return this.prisma.stroke.findMany({
      where: { bookId, userId: ownerId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(
    ownerId: string,
    bookId: string,
    dto: CreateStrokeDto,
  ): Promise<Stroke> {
    await this.getOwnedBookOrThrow(ownerId, bookId);

    return this.prisma.stroke.create({
      data: {
        userId: ownerId,
        bookId,
        pageIndex: dto.pageIndex,
        points: dto.points,
        color: dto.color,
        brush: dto.brush,
        size: dto.size,
      },
    });
  }

  async remove(
    ownerId: string,
    bookId: string,
    strokeId: string,
  ): Promise<void> {
    const stroke = await this.prisma.stroke.findUnique({
      where: { id: strokeId },
    });

    if (!stroke || stroke.userId !== ownerId || stroke.bookId !== bookId) {
      throw new NotFoundException('Trazo no encontrado.');
    }

    await this.prisma.stroke.delete({ where: { id: strokeId } });
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
