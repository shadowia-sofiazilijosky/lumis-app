export type LibraryDistributionBucket = "READ" | "TO_READ" | "READING" | "OTHER";

export interface LibraryDistributionEntry {
  bucket: LibraryDistributionBucket;
  count: number;
  percent: number;
}

export interface GenreStat {
  genre: string;
  count: number;
  percent: number;
}

export interface ReadingGoalStats {
  goal: number | null;
  readThisYear: number;
  remaining: number | null;
  percent: number | null;
  /** % change vs. the same point last year; null if there's nothing to compare. */
  comparisonPercent: number | null;
}

export type ActivityEventType = "FINISHED" | "ADDED" | "REVIEWED";

export interface ActivityEvent {
  type: ActivityEventType;
  bookId: string;
  bookTitle: string;
  bookCoverUrl: string | null;
  /** ISO datetime. */
  date: string;
}

export type AchievementKey = "FIRST_10" | "CRITIC" | "STREAK_7" | "NIGHT_OWL";

export interface AchievementStat {
  key: AchievementKey;
  unlocked: boolean;
}

export interface ProfileStats {
  /** ISO datetime — the account's own createdAt. */
  memberSince: string;
  counts: {
    totalBooks: number;
    totalRead: number;
    totalReviews: number;
    currentStreak: number;
  };
  libraryDistribution: LibraryDistributionEntry[];
  /** Top 5, sorted by count desc. */
  topGenres: GenreStat[];
  readingGoal: ReadingGoalStats;
  /** Most recent first, up to 5. */
  recentActivity: ActivityEvent[];
  achievements: AchievementStat[];
}

export interface StreakCalendarBook {
  id: string;
  title: string;
  coverUrl: string | null;
}

export interface StreakCalendarDay {
  /** YYYY-MM-DD, the user's own local calendar day. */
  date: string;
  isNight: boolean;
  /** Every book read that day — usually one, can be more. */
  books: StreakCalendarBook[];
}

export interface StreakCalendarMonth {
  year: number;
  /** 1-12. */
  month: number;
  /** Only days with at least one reading session — days without an entry
   * simply weren't read. */
  days: StreakCalendarDay[];
  /** YYYY-MM-DD, today in the user's own timezone — for highlighting
   * "today" consistently with how the streak itself is computed. */
  today: string;
}
