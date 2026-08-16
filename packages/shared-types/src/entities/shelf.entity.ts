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
}

export interface Shelf {
  id: string;
  ownerId: string;
  name: string;
  genre: string | null;
  arrangement: ShelfArrangement;
  shelfColor: string | null;
  backgroundColor: string | null;
  backgroundImageUrl: string | null;
  decorations: ShelfDecoration[];
  spotifyPlaylistId: string | null;
  spotifyPlaylistUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShelfListItem extends Shelf {
  bookCount: number;
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
