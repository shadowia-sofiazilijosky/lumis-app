"use client";

import type { Highlight, Note, Stroke } from "@lumis/shared-types";
import { create } from "zustand";

export interface PendingSelection {
  pageIndex: number;
  startOffset: number;
  endOffset: number;
  text: string;
  /** EPUB only. */
  cfi?: string;
  /** Viewport-relative — used to position the floating selection toolbar. */
  rect: DOMRect;
}

/** The drawing tool's current color/brush/size — chosen once via the panel,
 * then every stroke drawn on the page paints with it directly (no per-stroke
 * prompt), like a brush tool in an image editor. */
export interface DrawTool {
  color: string;
  brush: string;
  /** Base stroke thickness in px (at zoom = 1). */
  size: number;
}

interface AnnotationsState {
  highlights: Highlight[];
  notes: Note[];
  strokes: Stroke[];
  pendingSelection: PendingSelection | null;
  drawTool: DrawTool | null;
  drawToolPickerOpen: boolean;
  /** A note id being viewed/edited, `"new"` while composing one from `pendingSelection`, or null. */
  openNoteId: string | "new" | null;
  /** Viewport rect used to position the note popover when opening an *existing* note (pin/mark click). */
  openNoteRect: DOMRect | null;

  loadAll: (highlights: Highlight[], notes: Note[], strokes: Stroke[]) => void;
  addHighlight: (highlight: Highlight) => void;
  removeHighlightLocal: (id: string) => void;
  addNote: (note: Note) => void;
  updateNoteLocal: (id: string, patch: Partial<Note>) => void;
  removeNoteLocal: (id: string) => void;
  addStroke: (stroke: Stroke) => void;
  removeStrokeLocal: (id: string) => void;
  setPendingSelection: (selection: PendingSelection | null) => void;
  setDrawTool: (tool: DrawTool | null) => void;
  setDrawToolPickerOpen: (open: boolean) => void;
  startNewNote: () => void;
  openExistingNote: (id: string, rect: DOMRect) => void;
  closeNotePopover: () => void;
}

export const useAnnotationsStore = create<AnnotationsState>((set) => ({
  highlights: [],
  notes: [],
  strokes: [],
  pendingSelection: null,
  drawTool: null,
  drawToolPickerOpen: false,
  openNoteId: null,
  openNoteRect: null,

  loadAll: (highlights, notes, strokes) => set({ highlights, notes, strokes }),

  addHighlight: (highlight) =>
    set((state) => ({ highlights: [...state.highlights, highlight] })),

  removeHighlightLocal: (id) =>
    set((state) => ({
      highlights: state.highlights.filter((h) => h.id !== id),
    })),

  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),

  updateNoteLocal: (id, patch) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...patch } : note,
      ),
    })),

  removeNoteLocal: (id) =>
    set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),

  addStroke: (stroke) => set((state) => ({ strokes: [...state.strokes, stroke] })),

  removeStrokeLocal: (id) =>
    set((state) => ({ strokes: state.strokes.filter((s) => s.id !== id) })),

  setPendingSelection: (pendingSelection) => set({ pendingSelection }),

  setDrawTool: (drawTool) => set({ drawTool, drawToolPickerOpen: false }),

  setDrawToolPickerOpen: (drawToolPickerOpen) => set({ drawToolPickerOpen }),

  startNewNote: () => set({ openNoteId: "new" }),

  openExistingNote: (id, rect) =>
    set({ openNoteId: id, openNoteRect: rect, pendingSelection: null }),

  closeNotePopover: () =>
    set({ openNoteId: null, openNoteRect: null, pendingSelection: null }),
}));
