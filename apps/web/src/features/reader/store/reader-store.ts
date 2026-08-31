"use client";

import { ReaderTheme } from "@lumis/shared-types";
import { create } from "zustand";

export type FlipDirection = "forward" | "backward";
export type PageTurnMode = "horizontal" | "vertical" | "flip";
/** The page's own layout orientation -- distinct from PageTurnMode, which
 * is about which direction pages *turn*, not which way the page itself is
 * laid out. "landscape" rotates the rendered page 90°, useful for a
 * wide/landscape-shaped page (a comic spread, a wide PDF) on a portrait
 * phone or tablet. */
export type PageOrientation = "portrait" | "landscape";

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
  /** Two-page spread vs. one page at a time -- applies uniformly across
   * all three page-turn modes (horizontal, vertical, flip). */
  spreadView: boolean;
  /** "Line focus" guide that follows the pointer/touch over the reading
   * area -- persisted per book alongside readerTheme/pageTurnMode. */
  readingRulerEnabled: boolean;
  pageOrientation: PageOrientation;

  loadProgress: (bookId: string, progress: {
    currentPage: number;
    currentLocator: unknown;
    progressPercent: number;
    readerTheme: ReaderTheme;
    pageTurnMode: PageTurnMode;
    readingRulerEnabled: boolean;
    pageOrientation: PageOrientation;
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
  toggleReadingRuler: () => void;
  togglePageOrientation: () => void;
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
  spreadView: true,
  readingRulerEnabled: false,
  pageOrientation: "portrait",

  loadProgress: (bookId, progress) =>
    set({
      bookId,
      currentPage: progress.currentPage || 1,
      locator: progress.currentLocator,
      progressPercent: progress.progressPercent,
      theme: progress.readerTheme,
      pageTurnMode: progress.pageTurnMode,
      readingRulerEnabled: progress.readingRulerEnabled,
      pageOrientation: progress.pageOrientation,
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

  setPageTurnMode: (mode) => set({ pageTurnMode: mode, hasUnsavedChanges: true }),
  toggleSpreadView: () => set((state) => ({ spreadView: !state.spreadView })),
  toggleReadingRuler: () =>
    set((state) => ({
      readingRulerEnabled: !state.readingRulerEnabled,
      hasUnsavedChanges: true,
    })),
  togglePageOrientation: () =>
    set((state) => ({
      pageOrientation: state.pageOrientation === "portrait" ? "landscape" : "portrait",
      hasUnsavedChanges: true,
    })),
}));
