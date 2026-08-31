import { Injectable, NotFoundException } from '@nestjs/common';
import { Book, Prisma, ReadingProgress, ReadingStatus } from '@prisma/client';
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
        ...(dto.pageTurnMode !== undefined && { pageTurnMode: dto.pageTurnMode }),
        ...(dto.readingRulerEnabled !== undefined && {
          readingRulerEnabled: dto.readingRulerEnabled,
        }),
        ...(dto.pageOrientation !== undefined && { pageOrientation: dto.pageOrientation }),
      },
      update: {
        ...(dto.currentPage !== undefined && { currentPage: dto.currentPage }),
        ...(dto.currentLocator !== undefined && { currentLocator: locator }),
        ...(dto.progressPercent !== undefined && {
          progressPercent: dto.progressPercent,
        }),
        ...(dto.readerTheme !== undefined && { readerTheme: dto.readerTheme }),
        ...(dto.pageTurnMode !== undefined && { pageTurnMode: dto.pageTurnMode }),
        ...(dto.readingRulerEnabled !== undefined && {
          readingRulerEnabled: dto.readingRulerEnabled,
        }),
        ...(dto.pageOrientation !== undefined && { pageOrientation: dto.pageOrientation }),
      },
    });

    await this.logActivity(ownerId);
    await this.maybeMarkFinished(ownerId, bookId, dto.progressPercent);

    return progress;
  }

  // Reaching (essentially) the end of the book auto-marks it read on the
  // review, the same status the "ficha de lectura" would set by hand -- so
  // "libros leídos" and the library-distribution chart actually reflect
  // what got finished in the reader, not just what was manually flagged.
  private static readonly FINISH_THRESHOLD_PERCENT = 99;

  private async maybeMarkFinished(
    ownerId: string,
    bookId: string,
    progressPercent: number | undefined,
  ): Promise<void> {
    if (
      progressPercent === undefined ||
      progressPercent < ReadingProgressService.FINISH_THRESHOLD_PERCENT
    ) {
      return;
    }

    const existing = await this.prisma.review.findUnique({
      where: { userId_bookId: { userId: ownerId, bookId } },
      select: { status: true, finishedAt: true, startedAt: true },
    });

    // Already finished (or a reread) -- a later save near the end of the
    // book (re-reading the last page, say) shouldn't touch it again.
    if (
      existing?.status === ReadingStatus.FINISHED ||
      existing?.status === ReadingStatus.REREAD
    ) {
      return;
    }

    const now = new Date();
    await this.prisma.review.upsert({
      where: { userId_bookId: { userId: ownerId, bookId } },
      create: {
        userId: ownerId,
        bookId,
        status: ReadingStatus.FINISHED,
        startedAt: now,
        finishedAt: now,
      },
      update: {
        status: ReadingStatus.FINISHED,
        finishedAt: existing?.finishedAt ?? now,
        startedAt: existing?.startedAt ?? now,
      },
    });
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
