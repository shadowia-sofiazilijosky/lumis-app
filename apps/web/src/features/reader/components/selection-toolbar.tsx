"use client";

import { HighlightColor } from "@lumis/shared-types";
import { X } from "lucide-react";
import { HIGHLIGHT_COLOR_HEX, createHighlight } from "../api/annotations-client";
import { useAnnotationsStore } from "../store/annotations-store";

const COLORS: HighlightColor[] = [
  HighlightColor.YELLOW,
  HighlightColor.PINK,
  HighlightColor.GREEN,
  HighlightColor.BLUE,
];

/** Floating toolbar shown over an in-progress text selection: 4 highlight colors + "Nota". */
export function SelectionToolbar({ bookId }: { bookId: string }) {
  const pendingSelection = useAnnotationsStore((state) => state.pendingSelection);
  const openNoteId = useAnnotationsStore((state) => state.openNoteId);
  const addHighlight = useAnnotationsStore((state) => state.addHighlight);
  const setPendingSelection = useAnnotationsStore(
    (state) => state.setPendingSelection,
  );
  const startNewNote = useAnnotationsStore((state) => state.startNewNote);

  if (!pendingSelection || openNoteId !== null) return null;

  const { rect } = pendingSelection;
  const top = rect.top > 60 ? rect.top - 52 : rect.bottom + 10;

  async function handleColor(color: HighlightColor) {
    if (!pendingSelection) return;
    const highlight = await createHighlight(bookId, {
      color,
      pageIndex: pendingSelection.pageIndex,
      startOffset: pendingSelection.startOffset,
      endOffset: pendingSelection.endOffset,
      selectedText: pendingSelection.text,
      ...(pendingSelection.cfi && { cfi: pendingSelection.cfi }),
    });
    if (highlight) addHighlight(highlight);
    setPendingSelection(null);
    window.getSelection()?.removeAllRanges();
  }

  return (
    <div
      className="selection-toolbar"
      style={{ top, left: rect.left + rect.width / 2 }}
    >
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className="selection-toolbar-swatch"
          style={{ background: HIGHLIGHT_COLOR_HEX[color] }}
          aria-label={`Resaltar en ${color.toLowerCase()}`}
          onClick={() => handleColor(color)}
        />
      ))}
      <button type="button" className="selection-toolbar-note" onClick={startNewNote}>
        Nota
      </button>
      <button
        type="button"
        className="selection-toolbar-close"
        aria-label="Cerrar"
        onClick={() => setPendingSelection(null)}
      >
        <X size={14} />
      </button>
    </div>
  );
}
