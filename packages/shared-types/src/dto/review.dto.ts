import { ReadingStatus } from "../enums/reading-status.enum";
import { RecommendLevel } from "../enums/recommend-level.enum";
import type { RichTextBody } from "../entities/review.entity";

export interface UpsertReviewDto {
  status?: ReadingStatus;
  rating?: number;
  spicyRating?: number;
  romanceRating?: number;
  plotRating?: number;
  sadnessRating?: number;
  humorRating?: number;
  mysteryRating?: number;
  genre?: string;
  favoriteCharacter?: string;
  leastFavoriteCharacter?: string;
  favoriteQuote?: string;
  cried?: boolean;
  recommend?: RecommendLevel;
  bookNumberOfYear?: number;
  mood?: string;
  notes?: string;
  bodyRichText?: RichTextBody;
  startedAt?: string;
  finishedAt?: string;
}
