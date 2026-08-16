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

  loadShelf: (shelf: ShelfWithBooks) => void;
  patchShelfMeta: (patch: Partial<ShelfWithBooks>) => void;
  moveBook: (bookId: string, position: Position) => void;
  addBookLocally: (entry: ShelfBookEntry) => void;
  removeBookLocally: (bookId: string) => void;
  addDecoration: (decoration: ShelfDecoration) => void;
  moveDecoration: (id: string, position: Position) => void;
  removeDecoration: (id: string) => void;
  setSaveStatus: (status: SaveStatus) => void;
  markSaved: () => void;
}

export const useShelfEditorStore = create<ShelfEditorState>((set) => ({
  shelf: null,
  bookPositions: {},
  decorations: [],
  hasUnsavedChanges: false,
  saveStatus: "idle",

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

  removeDecoration: (id) =>
    set((state) => ({
      decorations: state.decorations.filter(
        (decoration) => decoration.id !== id,
      ),
      hasUnsavedChanges: true,
    })),

  setSaveStatus: (status) => set({ saveStatus: status }),

  markSaved: () => set({ hasUnsavedChanges: false, saveStatus: "saved" }),
}));
