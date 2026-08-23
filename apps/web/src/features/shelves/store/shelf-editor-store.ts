"use client";

import type {
  Position,
  ShelfBookEntry,
  ShelfDecoration,
  ShelfWithBooks,
} from "@lumis/shared-types";
import { create } from "zustand";
import { DEFAULT_BOOK_POSITION } from "../lib/canvas";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface ShelfEditorState {
  shelf: ShelfWithBooks | null;
  bookPositions: Record<string, Position>;
  decorations: ShelfDecoration[];
  hasUnsavedChanges: boolean;
  saveStatus: SaveStatus;
  selectedBookId: string | null;
  selectedDecorationId: string | null;

  loadShelf: (shelf: ShelfWithBooks) => void;
  patchShelfMeta: (patch: Partial<ShelfWithBooks>) => void;
  moveBook: (bookId: string, position: Position) => void;
  setBookCustomSpineImage: (
    bookId: string,
    customSpineImageKey: string,
    customSpineImageUrl: string | null,
  ) => void;
  addBookLocally: (entry: ShelfBookEntry) => void;
  removeBookLocally: (bookId: string) => void;
  addDecoration: (decoration: ShelfDecoration) => void;
  moveDecoration: (id: string, position: Position) => void;
  resizeDecoration: (id: string, size: { width: number; height: number }) => void;
  removeDecoration: (id: string) => void;
  setSaveStatus: (status: SaveStatus) => void;
  markSaved: () => void;
  selectBook: (bookId: string | null) => void;
  selectDecoration: (id: string | null) => void;
}

export const useShelfEditorStore = create<ShelfEditorState>((set) => ({
  shelf: null,
  bookPositions: {},
  decorations: [],
  hasUnsavedChanges: false,
  saveStatus: "idle",
  selectedBookId: null,
  selectedDecorationId: null,

  loadShelf: (shelf) => {
    const bookPositions: Record<string, Position> = {};
    for (const entry of shelf.books) {
      bookPositions[entry.bookId] = entry.position ?? DEFAULT_BOOK_POSITION;
    }
    set({
      shelf,
      bookPositions,
      decorations: shelf.decorations,
      hasUnsavedChanges: false,
      saveStatus: "idle",
    });
  },

  patchShelfMeta: (patch) =>
    set((state) =>
      state.shelf ? { shelf: { ...state.shelf, ...patch } } : state,
    ),

  moveBook: (bookId, position) =>
    set((state) => ({
      bookPositions: { ...state.bookPositions, [bookId]: position },
      hasUnsavedChanges: true,
    })),

  setBookCustomSpineImage: (bookId, customSpineImageKey, customSpineImageUrl) =>
    set((state) => ({
      bookPositions: {
        ...state.bookPositions,
        [bookId]: {
          ...(state.bookPositions[bookId] ?? { x: 0, y: 0 }),
          customSpineImageKey,
          customSpineImageUrl: customSpineImageUrl ?? undefined,
        },
      },
    })),

  selectBook: (bookId) => set({ selectedBookId: bookId }),

  addBookLocally: (entry) =>
    set((state) => {
      if (!state.shelf) return state;
      return {
        shelf: { ...state.shelf, books: [...state.shelf.books, entry] },
        bookPositions: {
          ...state.bookPositions,
          [entry.bookId]: entry.position ?? DEFAULT_BOOK_POSITION,
        },
      };
    }),

  removeBookLocally: (bookId) =>
    set((state) => {
      if (!state.shelf) return state;
      const nextPositions = { ...state.bookPositions };
      delete nextPositions[bookId];
      return {
        shelf: {
          ...state.shelf,
          books: state.shelf.books.filter((entry) => entry.bookId !== bookId),
        },
        bookPositions: nextPositions,
      };
    }),

  addDecoration: (decoration) =>
    set((state) => ({
      decorations: [...state.decorations, decoration],
      hasUnsavedChanges: true,
    })),

  moveDecoration: (id, position) =>
    set((state) => ({
      decorations: state.decorations.map((decoration) =>
        decoration.id === id ? { ...decoration, ...position } : decoration,
      ),
      hasUnsavedChanges: true,
    })),

  resizeDecoration: (id, size) =>
    set((state) => ({
      decorations: state.decorations.map((decoration) =>
        decoration.id === id ? { ...decoration, ...size } : decoration,
      ),
      hasUnsavedChanges: true,
    })),

  removeDecoration: (id) =>
    set((state) => ({
      decorations: state.decorations.filter(
        (decoration) => decoration.id !== id,
      ),
      hasUnsavedChanges: true,
    })),

  selectDecoration: (id) => set({ selectedDecorationId: id }),

  setSaveStatus: (status) => set({ saveStatus: status }),

  markSaved: () => set({ hasUnsavedChanges: false, saveStatus: "saved" }),
}));
