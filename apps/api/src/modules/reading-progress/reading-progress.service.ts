import { Injectable, NotFoundException } from '@nestjs/common';
import { Book, Prisma, ReadingProgress } from '@prisma/client';
import {
  dateKeyToUtcMidnight,
  isNightHour,
  localDateKey,
} from '../../common/timezone.util';
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

    const progress = await this.prisma.readingProgress.upsert({
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

    await this.logActivity(ownerId);

    return progress;
  }

  // ReadingProgress is a single mutable row per (user, book) -- it can't
  // answer "which days did this user read on", so every save also stamps a
  // one-row-per-local-day activity log, the actual source for the streak
  // and "night reading" achievement.
  private async logActivity(ownerId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: { timezone: true },
    });

    const now = new Date();
    const dateKey = localDateKey(now, user?.timezone);
    const date = dateKeyToUtcMidnight(dateKey);
    const night = isNightHour(now, user?.timezone);

    await this.prisma.readingActivityLog.upsert({
      where: { userId_date: { userId: ownerId, date } },
      create: { userId: ownerId, date, isNight: night },
      // Once true for the day, stays true even if a later save that same
      // day happens to land outside the night band.
      update: night ? { isNight: true } : {},
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
