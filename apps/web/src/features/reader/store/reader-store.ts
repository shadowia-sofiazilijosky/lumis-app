"use client";

import { ReaderTheme } from "@lumis/shared-types";
import { create } from "zustand";

export type FlipDirection = "forward" | "backward";

interface ReaderState {
  bookId: string | null;
  theme: ReaderTheme;
  controlsVisible: boolean;
  currentPage: number;
  totalPages: number | null;
  locator: unknown;
  progressPercent: number;
  flipDirection: FlipDirection;
  hasUnsavedChanges: boolean;

  loadProgress: (bookId: string, progress: {
    currentPage: number;
    currentLocator: unknown;
    progressPercent: number;
    readerTheme: ReaderTheme;
  }) => void;
  setTotalPages: (totalPages: number | null) => void;
  goToPage: (page: number) => void;
  goToLocator: (locator: unknown, progressPercent?: number) => void;
  setTheme: (theme: ReaderTheme) => void;
  toggleControls: () => void;
  showControls: () => void;
  hideControls: () => void;
  markSaved: () => void;
}

export const useReaderStore = create<ReaderState>((set) => ({
  bookId: null,
  theme: ReaderTheme.LIGHT,
  controlsVisible: false,
  currentPage: 1,
  totalPages: null,
  locator: null,
  progressPercent: 0,
  flipDirection: "forward",
  hasUnsavedChanges: false,

  loadProgress: (bookId, progress) =>
    set({
      bookId,
      currentPage: progress.currentPage || 1,
      locator: progress.currentLocator,
      progressPercent: progress.progressPercent,
      theme: progress.readerTheme,
      hasUnsavedChanges: false,
    }),

  setTotalPages: (totalPages) => set({ totalPages }),

  goToPage: (page) =>
    set((state) => {
      if (page === state.currentPage) return state;
      const progressPercent = state.totalPages
        ? Math.min(100, Math.round((page / state.totalPages) * 100))
        : state.progressPercent;
      return {
        currentPage: page,
        progressPercent,
        flipDirection: page > state.currentPage ? "forward" : "backward",
        hasUnsavedChanges: true,
      };
    }),

  goToLocator: (locator, progressPercent) =>
    set((state) => ({
      locator,
      progressPercent: progressPercent ?? state.progressPercent,
      hasUnsavedChanges: true,
    })),

  setTheme: (theme) => set({ theme, hasUnsavedChanges: true }),

  toggleControls: () => set((state) => ({ controlsVisible: !state.controlsVisible })),
  showControls: () => set({ controlsVisible: true }),
  hideControls: () => set({ controlsVisible: false }),

  markSaved: () => set({ hasUnsavedChanges: false }),
}));
