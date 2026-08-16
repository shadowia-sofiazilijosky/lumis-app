import { ShelfArrangement } from "../enums/shelf-arrangement.enum";
import { ShelfDecoration } from "../entities/shelf.entity";
import { Position } from "../entities/position.entity";

export interface CreateShelfInput {
  name: string;
  genre?: string;
  arrangement?: ShelfArrangement;
  shelfColor?: string;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  decorations?: ShelfDecoration[];
  sortOrder?: number;
}

export type UpdateShelfInput = Partial<CreateShelfInput>;

export interface AddBookToShelfInput {
  bookId: string;
  position?: Position;
}

export interface BookPositionInput {
  bookId: string;
  position: Position;
}

export interface UpdateShelfLayoutInput {
  positions: BookPositionInput[];
}
