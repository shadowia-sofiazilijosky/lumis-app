import { Injectable, NotFoundException } from '@nestjs/common';
import { Book, Prisma, ReadingProgress } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { UpdateReadingProgressDto } from './dto/update-reading-progress.dto';

@Injectable()
export class ReadingProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async get(ownerId: string, bookId: string): Promise<ReadingProgress | null> {
    await this.getOwnedBookOrThrow(ownerId, bookId);

    return this.prisma.readingProgress.findUnique({
      where: { userId_bookId: { userId: ownerId, bookId } },
    });
  }

  async upsert(
    ownerId: string,
    bookId: string,
    dto: UpdateReadingProgressDto,
  ): Promise<ReadingProgress> {
    await this.getOwnedBookOrThrow(ownerId, bookId);

    const locator = dto.currentLocator as Prisma.InputJsonValue | undefined;

    return this.prisma.readingProgress.upsert({
      where: { userId_bookId: { userId: ownerId, bookId } },
      create: {
        userId: ownerId,
        bookId,
        currentPage: dto.currentPage ?? 0,
        currentLocator: locator,
        progressPercent: dto.progressPercent ?? 0,
        readerTheme: dto.readerTheme,
      },
      update: {
        ...(dto.currentPage !== undefined && { currentPage: dto.currentPage }),
        ...(dto.currentLocator !== undefined && { currentLocator: locator }),
        ...(dto.progressPercent !== undefined && {
          progressPercent: dto.progressPercent,
        }),
        ...(dto.readerTheme !== undefined && { readerTheme: dto.readerTheme }),
      },
    });
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
