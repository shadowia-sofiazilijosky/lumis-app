import { ShelfArrangement } from "../enums/shelf-arrangement.enum";
import { BookSummary } from "./book.entity";
import { Position } from "./position.entity";

export interface ShelfDecoration {
  id: string;
  type: string;
  variant?: string;
  x: number;
  y: number;
  rotation?: number;
  width?: number;
  height?: number;
  /** Once locked, the item can't be dragged or resized until unlocked. */
  locked?: boolean;
}

export interface Shelf {
  id: string;
  ownerId: string;
  name: string;
  genre: string | null;
  arrangement: ShelfArrangement;
  shelfColor: string | null;
  shelfFrame: string | null;
  backgroundColor: string | null;
  backgroundImageUrl: string | null;
  canvasWidth: number | null;
  canvasHeight: number | null;
  decorations: ShelfDecoration[];
  spotifyPlaylistId: string | null;
  spotifyPlaylistUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShelfListItem extends Shelf {
  bookCount: number;
  previewCovers: string[];
}

export interface ShelfBookEntry {
  bookId: string;
  position: Position | null;
  addedAt: string;
  book: BookSummary;
}

export interface ShelfWithBooks extends Shelf {
  books: ShelfBookEntry[];
}
