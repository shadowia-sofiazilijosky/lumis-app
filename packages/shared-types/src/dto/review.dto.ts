import { ReadingStatus } from "../enums/reading-status.enum";
import type { RichTextBody } from "../entities/review.entity";

export interface UpsertReviewDto {
  status?: ReadingStatus;
  rating?: number;
  spicyRating?: number;
  romanceRating?: number;
  bodyRichText?: RichTextBody;
  startedAt?: string;
  finishedAt?: string;
}
