"use client";

import type { Highlight, Note } from "@lumis/shared-types";
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

interface AnnotationsState {
  highlights: Highlight[];
  notes: Note[];
  pendingSelection: PendingSelection | null;
  /** A note id being viewed/edited, `"new"` while composing one from `pendingSelection`, or null. */
  openNoteId: string | "new" | null;
  /** Viewport rect used to position the note popover when opening an *existing* note (pin/mark click). */
  openNoteRect: DOMRect | null;

  loadAll: (highlights: Highlight[], notes: Note[]) => void;
  addHighlight: (highlight: Highlight) => void;
  removeHighlightLocal: (id: string) => void;
  addNote: (note: Note) => void;
  updateNoteLocal: (id: string, patch: Partial<Note>) => void;
  removeNoteLocal: (id: string) => void;
  setPendingSelection: (selection: PendingSelection | null) => void;
  startNewNote: () => void;
  openExistingNote: (id: string, rect: DOMRect) => void;
  closeNotePopover: () => void;
}

export const useAnnotationsStore = create<AnnotationsState>((set) => ({
  highlights: [],
  notes: [],
  pendingSelection: null,
  openNoteId: null,
  openNoteRect: null,

  loadAll: (highlights, notes) => set({ highlights, notes }),

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

  setPendingSelection: (pendingSelection) => set({ pendingSelection }),

  startNewNote: () => set({ openNoteId: "new" }),

  openExistingNote: (id, rect) =>
    set({ openNoteId: id, openNoteRect: rect, pendingSelection: null }),

  closeNotePopover: () =>
    set({ openNoteId: null, openNoteRect: null, pendingSelection: null }),
}));
