import { ReadingStatus } from "../enums/reading-status.enum";
import { RecommendLevel } from "../enums/recommend-level.enum";
import type { RichTextBody } from "../entities/review.entity";

export interface UpsertReviewDto {
  status?: ReadingStatus;
  rating?: number | null;
  spicyRating?: number | null;
  romanceRating?: number | null;
  plotRating?: number | null;
  sadnessRating?: number | null;
  humorRating?: number | null;
  mysteryRating?: number | null;
  genre?: string;
  favoriteCharacter?: string;
  leastFavoriteCharacter?: string;
  favoriteQuote?: string;
  cried?: boolean | null;
  recommend?: RecommendLevel | null;
  bookNumberOfYear?: number | null;
  mood?: string;
  notes?: string;
  bodyRichText?: RichTextBody;
  startedAt?: string | null;
  finishedAt?: string | null;
}
