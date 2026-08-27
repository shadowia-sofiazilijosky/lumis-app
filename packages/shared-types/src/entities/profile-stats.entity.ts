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
