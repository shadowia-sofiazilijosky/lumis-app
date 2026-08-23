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

interface LayoutSnapshot {
  bookPositions: Record<string, Position>;
  decorations: ShelfDecoration[];
}

const MAX_HISTORY = 30;

interface ShelfEditorState {
  shelf: ShelfWithBooks | null;
  bookPositions: Record<string, Position>;
  decorations: ShelfDecoration[];
  hasUnsavedChanges: boolean;
  saveStatus: SaveStatus;
  selectedBookId: string | null;
  selectedDecorationId: string | null;
  decorationModeEnabled: boolean;
  past: LayoutSnapshot[];
  future: LayoutSnapshot[];

  loadShelf: (shelf: ShelfWithBooks) => void;
  patchShelfMeta: (patch: Partial<ShelfWithBooks>) => void;
  moveBook: (bookId: string, position: Position) => void;
  resizeBook: (bookId: string, size: { width: number; height: number }) => void;
  toggleBookLock: (bookId: string) => void;
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
  setDecorationVariant: (id: string, variant: string) => void;
  toggleDecorationLock: (id: string) => void;
  removeDecoration: (id: string) => void;
  setSaveStatus: (status: SaveStatus) => void;
  markSaved: () => void;
  selectBook: (bookId: string | null) => void;
  selectDecoration: (id: string | null) => void;
  toggleDecorationMode: () => void;
  undo: () => void;
  redo: () => void;
}

export const useShelfEditorStore = create<ShelfEditorState>((set, get) => {
  /** Snapshots the layout onto the undo stack before a mutation, and clears
   * the redo stack — the standard "any new edit invalidates future redos" rule. */
  function pushHistory() {
    const { bookPositions, decorations, past } = get();
    const snapshot: LayoutSnapshot = {
      bookPositions: { ...bookPositions },
      decorations: [...decorations],
    };
    set({
      past: [...past.slice(-(MAX_HISTORY - 1)), snapshot],
      future: [],
    });
  }

  return {
    shelf: null,
    bookPositions: {},
    decorations: [],
    hasUnsavedChanges: false,
    saveStatus: "idle",
    selectedBookId: null,
    selectedDecorationId: null,
    decorationModeEnabled: true,
    past: [],
    future: [],

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
        past: [],
        future: [],
      });
    },

    patchShelfMeta: (patch) =>
      set((state) =>
        state.shelf ? { shelf: { ...state.shelf, ...patch } } : state,
      ),

    moveBook: (bookId, position) => {
      pushHistory();
      set((state) => ({
        bookPositions: { ...state.bookPositions, [bookId]: position },
        hasUnsavedChanges: true,
      }));
    },

    resizeBook: (bookId, size) => {
      pushHistory();
      set((state) => ({
        bookPositions: {
          ...state.bookPositions,
          [bookId]: { ...(state.bookPositions[bookId] ?? { x: 0, y: 0 }), ...size },
        },
        hasUnsavedChanges: true,
      }));
    },

    toggleBookLock: (bookId) =>
      set((state) => {
        const current = state.bookPositions[bookId] ?? { x: 0, y: 0 };
        return {
          bookPositions: {
            ...state.bookPositions,
            [bookId]: { ...current, locked: !current.locked },
          },
          hasUnsavedChanges: true,
        };
      }),

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

    addDecoration: (decoration) => {
      pushHistory();
      set((state) => ({
        decorations: [...state.decorations, decoration],
        hasUnsavedChanges: true,
      }));
    },

    moveDecoration: (id, position) => {
      pushHistory();
      set((state) => ({
        decorations: state.decorations.map((decoration) =>
          decoration.id === id ? { ...decoration, ...position } : decoration,
        ),
        hasUnsavedChanges: true,
      }));
    },

    resizeDecoration: (id, size) => {
      pushHistory();
      set((state) => ({
        decorations: state.decorations.map((decoration) =>
          decoration.id === id ? { ...decoration, ...size } : decoration,
        ),
        hasUnsavedChanges: true,
      }));
    },

    setDecorationVariant: (id, variant) => {
      pushHistory();
      set((state) => ({
        decorations: state.decorations.map((decoration) =>
          decoration.id === id ? { ...decoration, variant } : decoration,
        ),
        hasUnsavedChanges: true,
      }));
    },

    toggleDecorationLock: (id) =>
      set((state) => ({
        decorations: state.decorations.map((decoration) =>
          decoration.id === id
            ? { ...decoration, locked: !decoration.locked }
            : decoration,
        ),
        hasUnsavedChanges: true,
      })),

    removeDecoration: (id) => {
      pushHistory();
      set((state) => ({
        decorations: state.decorations.filter(
          (decoration) => decoration.id !== id,
        ),
        hasUnsavedChanges: true,
      }));
    },

    selectDecoration: (id) => set({ selectedDecorationId: id }),

    toggleDecorationMode: () =>
      set((state) => ({ decorationModeEnabled: !state.decorationModeEnabled })),

    undo: () => {
      const { past, bookPositions, decorations, future } = get();
      const previous = past[past.length - 1];
      if (!previous) return;
      set({
        bookPositions: previous.bookPositions,
        decorations: previous.decorations,
        past: past.slice(0, -1),
        future: [{ bookPositions, decorations }, ...future],
        hasUnsavedChanges: true,
      });
    },

    redo: () => {
      const { future, bookPositions, decorations, past } = get();
      const next = future[0];
      if (!next) return;
      set({
        bookPositions: next.bookPositions,
        decorations: next.decorations,
        future: future.slice(1),
        past: [...past, { bookPositions, decorations }],
        hasUnsavedChanges: true,
      });
    },

    setSaveStatus: (status) => set({ saveStatus: status }),

    markSaved: () => set({ hasUnsavedChanges: false, saveStatus: "saved" }),
  };
});
