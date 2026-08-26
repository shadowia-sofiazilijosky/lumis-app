"use client";

import { ReaderTheme } from "@lumis/shared-types";
import { create } from "zustand";

export type FlipDirection = "forward" | "backward";
export type PageTurnMode = "horizontal" | "vertical" | "flip";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.15;

function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

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
  zoom: number;
  pageTurnMode: PageTurnMode;
  /** "libro real" mode only -- show a two-page spread (like an open book)
   * instead of one page at a time. */
  spreadView: boolean;

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
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setPageTurnMode: (mode: PageTurnMode) => void;
  toggleSpreadView: () => void;
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
  zoom: 1,
  pageTurnMode: "flip",
  spreadView: false,

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

  setZoom: (zoom) => set({ zoom: clampZoom(zoom) }),
  zoomIn: () => set((state) => ({ zoom: clampZoom(state.zoom + ZOOM_STEP) })),
  zoomOut: () => set((state) => ({ zoom: clampZoom(state.zoom - ZOOM_STEP) })),
  resetZoom: () => set({ zoom: 1 }),

  setPageTurnMode: (mode) => set({ pageTurnMode: mode }),
  toggleSpreadView: () => set((state) => ({ spreadView: !state.spreadView })),
}));
