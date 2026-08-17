import { ReadingStatus } from "../enums/reading-status.enum";

export interface RichTextBody {
  html: string;
}

export interface Review {
  id: string;
  userId: string;
  bookId: string;
  status: ReadingStatus;
  rating: number | null;
  spicyRating: number | null;
  romanceRating: number | null;
  bodyRichText: RichTextBody | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
