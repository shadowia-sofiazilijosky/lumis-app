import { ReadingStatus } from "../enums/reading-status.enum";
import { RecommendLevel } from "../enums/recommend-level.enum";

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
  /** 1-5 -- "plot" theme rating. */
  plotRating: number | null;
  /** 1-5 -- "tristeza" theme rating. */
  sadnessRating: number | null;
  /** 1-5 -- "humor" theme rating. */
  humorRating: number | null;
  /** 1-5 -- "misterio" theme rating. */
  mysteryRating: number | null;
  genre: string | null;
  favoriteCharacter: string | null;
  leastFavoriteCharacter: string | null;
  favoriteQuote: string | null;
  cried: boolean | null;
  recommend: RecommendLevel | null;
  bookNumberOfYear: number | null;
  mood: string | null;
  notes: string | null;
  bodyRichText: RichTextBody | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
