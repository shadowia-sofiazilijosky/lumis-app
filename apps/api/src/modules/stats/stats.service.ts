import { Injectable } from '@nestjs/common';
import { Prisma, ReadingStatus } from '@prisma/client';
import type {
  ActivityEvent,
  AchievementKey,
  AchievementStat,
  GenreStat,
  LibraryDistributionBucket,
  LibraryDistributionEntry,
  ProfileStats,
  ReadingGoalStats,
  StreakCalendarMonth,
} from '@lumis/shared-types';
import { localDateKey, safeTimezone } from '../../common/timezone.util';
import { PrismaService } from '../../database/prisma.service';
import { SupabaseStorageService } from '../../storage/supabase-storage.service';

const READ_STATUSES: ReadingStatus[] = [
  ReadingStatus.FINISHED,
  ReadingStatus.REREAD,
];
const READING_STATUSES: ReadingStatus[] = [
  ReadingStatus.READING,
  ReadingStatus.PAUSED,
];
const STREAK_LOOKBACK_DAYS = 400;
const RECENT_ACTIVITY_LIMIT = 5;
const TOP_GENRES_LIMIT = 5;

function hasWrittenContent(bodyRichText: unknown): boolean {
  if (!bodyRichText || typeof bodyRichText !== 'object') return false;
  const html = (bodyRichText as { html?: unknown }).html;
  return (
    typeof html === 'string' && html.replace(/<[^>]*>/g, '').trim().length > 0
  );
}

@Injectable()
export class StatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: SupabaseStorageService,
  ) {}

  async getProfileStats(userId: string): Promise<ProfileStats> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { createdAt: true, timezone: true, readingGoal: true },
    });

    const [
      totalBooks,
      totalReadCount,
      writtenReviewCount,
      currentStreak,
      libraryDistribution,
      topGenres,
      readingGoal,
      recentActivity,
    ] = await Promise.all([
      this.prisma.book.count({ where: { ownerId: userId } }),
      this.prisma.review.count({
        where: { userId, status: { in: READ_STATUSES } },
      }),
      this.countWrittenReviews(userId),
      this.computeStreak(userId, user.timezone),
      this.getLibraryDistribution(userId),
      this.getTopGenres(userId),
      this.getReadingGoalStats(userId, user.timezone, user.readingGoal),
      this.getRecentActivity(userId),
    ]);

    const achievements = await this.getAchievements(userId, {
      totalBooks,
      writtenReviewCount,
      currentStreak,
    });

    return {
      memberSince: user.createdAt.toISOString(),
      counts: {
        totalBooks,
        totalRead: totalReadCount,
        totalReviews: writtenReviewCount,
        currentStreak,
      },
      libraryDistribution,
      topGenres,
      readingGoal,
      recentActivity,
      achievements,
    };
  }

  // "Wrote a review" means actual written content, not just a status/rating
  // change -- fetched then filtered in JS since checking a nested JSON
  // field's non-emptiness isn't a portable Prisma `where` clause.
  private async countWrittenReviews(userId: string): Promise<number> {
    const reviews = await this.prisma.review.findMany({
      where: { userId, bodyRichText: { not: Prisma.DbNull } },
      select: { bodyRichText: true },
    });
    return reviews.filter((review) => hasWrittenContent(review.bodyRichText))
      .length;
  }

  // ReadingProgress alone can't answer "which days did this user read on" --
  // it's one mutable row per book. ReadingActivityLog is the actual event
  // log this walks backward from "today" (in the user's own timezone) to
  // count consecutive days, continuing from yesterday if today has no entry
  // yet (so the streak doesn't zero out before the user has read *today*).
  private async computeStreak(
    userId: string,
    timezone: string | null,
  ): Promise<number> {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - STREAK_LOOKBACK_DAYS);

    const logs = await this.prisma.readingActivityLog.findMany({
      where: { userId, date: { gte: since } },
      select: { date: true },
    });
    const dateKeys = new Set(
      logs.map((log) => log.date.toISOString().slice(0, 10)),
    );

    const todayKey = localDateKey(new Date(), timezone);
    const cursor = new Date(`${todayKey}T00:00:00.000Z`);
    if (!dateKeys.has(todayKey)) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    let streak = 0;
    while (dateKeys.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return streak;
  }

  // Powers the streak calendar page — one month at a time (year, 1-12
  // month), so browsing back through years stays a small, cheap query
  // instead of ever loading a user's whole history at once.
  async getStreakCalendarMonth(
    userId: string,
    year: number,
    month: number,
  ): Promise<StreakCalendarMonth> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { timezone: true },
    });

    const startUtc = new Date(Date.UTC(year, month - 1, 1));
    const endUtc = new Date(Date.UTC(year, month, 1));

    const logs = await this.prisma.readingActivityLog.findMany({
      where: { userId, date: { gte: startUtc, lt: endUtc } },
      orderBy: { date: 'asc' },
      include: {
        books: {
          include: {
            book: { select: { id: true, title: true, coverImageKey: true } },
          },
        },
      },
    });

    const days = await Promise.all(
      logs.map(async (log) => ({
        date: log.date.toISOString().slice(0, 10),
        isNight: log.isNight,
        books: await Promise.all(
          log.books.map(async (entry) => ({
            id: entry.book.id,
            title: entry.book.title,
            coverUrl: entry.book.coverImageKey
              ? await this.storage.createSignedUrl(entry.book.coverImageKey)
              : null,
          })),
        ),
      })),
    );

    return {
      year,
      month,
      days,
      today: localDateKey(new Date(), user.timezone),
    };
  }

  private async getLibraryDistribution(
    userId: string,
  ): Promise<LibraryDistributionEntry[]> {
    const books = await this.prisma.book.findMany({
      where: { ownerId: userId },
      select: {
        reviews: { where: { userId }, select: { status: true }, take: 1 },
      },
    });

    const counts: Record<LibraryDistributionBucket, number> = {
      READ: 0,
      TO_READ: 0,
      READING: 0,
      OTHER: 0,
    };

    for (const book of books) {
      const status = book.reviews[0]?.status ?? ReadingStatus.TBR;
      if (READ_STATUSES.includes(status)) counts.READ++;
      else if (READING_STATUSES.includes(status)) counts.READING++;
      else if (status === ReadingStatus.ABANDONED) counts.OTHER++;
      else counts.TO_READ++;
    }

    const total = books.length || 1;
    return (Object.keys(counts) as LibraryDistributionBucket[]).map(
      (bucket) => ({
        bucket,
        count: counts[bucket],
        percent: Math.round((counts[bucket] / total) * 100),
      }),
    );
  }

  private async getTopGenres(userId: string): Promise<GenreStat[]> {
    const reviews = await this.prisma.review.findMany({
      where: { userId, genre: { not: null } },
      select: { genre: true },
    });

    const byKey = new Map<string, { genre: string; count: number }>();
    for (const review of reviews) {
      const raw = review.genre?.trim();
      if (!raw) continue;
      const key = raw.toLowerCase();
      const entry = byKey.get(key);
      if (entry) entry.count++;
      // First-seen casing wins as the display label.
      else byKey.set(key, { genre: raw, count: 1 });
    }

    const total =
      [...byKey.values()].reduce((sum, entry) => sum + entry.count, 0) || 1;
    return [...byKey.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, TOP_GENRES_LIMIT)
      .map((entry) => ({
        genre: entry.genre,
        count: entry.count,
        percent: Math.round((entry.count / total) * 100),
      }));
  }

  private async getReadingGoalStats(
    userId: string,
    timezone: string | null,
    goal: number | null,
  ): Promise<ReadingGoalStats> {
    const now = new Date();
    const tz = safeTimezone(timezone);
    const currentYear = Number(localDateKey(now, tz).slice(0, 4));

    const [readThisYear, readLastYearSoFar] = await Promise.all([
      this.prisma.review.count({
        where: {
          userId,
          status: { in: READ_STATUSES },
          finishedAt: {
            gte: new Date(Date.UTC(currentYear, 0, 1)),
            lte: now,
          },
        },
      }),
      this.prisma.review.count({
        where: {
          userId,
          status: { in: READ_STATUSES },
          finishedAt: {
            gte: new Date(Date.UTC(currentYear - 1, 0, 1)),
            lte: new Date(
              Date.UTC(
                currentYear - 1,
                now.getUTCMonth(),
                now.getUTCDate(),
                23,
                59,
                59,
              ),
            ),
          },
        },
      }),
    ]);

    const comparisonPercent =
      readLastYearSoFar > 0
        ? Math.round(
            ((readThisYear - readLastYearSoFar) / readLastYearSoFar) * 100,
          )
        : null;

    return {
      goal,
      readThisYear,
      remaining: goal !== null ? Math.max(0, goal - readThisYear) : null,
      percent:
        goal !== null && goal > 0
          ? Math.min(100, Math.round((readThisYear / goal) * 100))
          : null,
      comparisonPercent,
    };
  }

  private async getRecentActivity(userId: string): Promise<ActivityEvent[]> {
    const [finished, added, reviewed] = await Promise.all([
      this.prisma.review.findMany({
        where: { userId, finishedAt: { not: null } },
        orderBy: { finishedAt: 'desc' },
        take: RECENT_ACTIVITY_LIMIT,
        select: {
          finishedAt: true,
          book: { select: { id: true, title: true, coverImageKey: true } },
        },
      }),
      this.prisma.book.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' },
        take: RECENT_ACTIVITY_LIMIT,
        select: { id: true, title: true, coverImageKey: true, createdAt: true },
      }),
      this.prisma.review.findMany({
        where: { userId, bodyRichText: { not: Prisma.DbNull } },
        orderBy: { updatedAt: 'desc' },
        take: RECENT_ACTIVITY_LIMIT * 2, // over-fetch, some get filtered out below
        select: {
          updatedAt: true,
          bodyRichText: true,
          book: { select: { id: true, title: true, coverImageKey: true } },
        },
      }),
    ]);

    type Candidate = {
      type: ActivityEvent['type'];
      date: Date;
      bookId: string;
      bookTitle: string;
      coverImageKey: string | null;
    };

    const candidates: Candidate[] = [
      ...finished.map((review) => ({
        type: 'FINISHED' as const,
        date: review.finishedAt!,
        bookId: review.book.id,
        bookTitle: review.book.title,
        coverImageKey: review.book.coverImageKey,
      })),
      ...added.map((book) => ({
        type: 'ADDED' as const,
        date: book.createdAt,
        bookId: book.id,
        bookTitle: book.title,
        coverImageKey: book.coverImageKey,
      })),
      ...reviewed
        .filter((review) => hasWrittenContent(review.bodyRichText))
        .map((review) => ({
          type: 'REVIEWED' as const,
          date: review.updatedAt,
          bookId: review.book.id,
          bookTitle: review.book.title,
          coverImageKey: review.book.coverImageKey,
        })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, RECENT_ACTIVITY_LIMIT);

    return Promise.all(
      candidates.map(async (candidate) => ({
        type: candidate.type,
        bookId: candidate.bookId,
        bookTitle: candidate.bookTitle,
        bookCoverUrl: candidate.coverImageKey
          ? await this.storage.createSignedUrl(candidate.coverImageKey)
          : null,
        date: candidate.date.toISOString(),
      })),
    );
  }

  private async getAchievements(
    userId: string,
    data: {
      totalBooks: number;
      writtenReviewCount: number;
      currentStreak: number;
    },
  ): Promise<AchievementStat[]> {
    const hasNightActivity = await this.prisma.readingActivityLog.findFirst({
      where: { userId, isNight: true },
      select: { id: true },
    });

    const unlocked: Record<AchievementKey, boolean> = {
      FIRST_10: data.totalBooks >= 10,
      CRITIC: data.writtenReviewCount >= 5,
      STREAK_7: data.currentStreak >= 7,
      NIGHT_OWL: hasNightActivity !== null,
    };

    return (Object.keys(unlocked) as AchievementKey[]).map((key) => ({
      key,
      unlocked: unlocked[key],
    }));
  }
}
