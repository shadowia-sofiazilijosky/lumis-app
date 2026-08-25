"use client";

import { X } from "lucide-react";
import { useAnnotationsStore } from "../store/annotations-store";

/** Floating toolbar shown over a text selection made with NO highlighter pen
 * active — at that point the only thing to do with a plain selection is
 * attach a note (color/size now live in the pen panel, chosen up front). */
export function SelectionToolbar() {
  const pendingSelection = useAnnotationsStore((state) => state.pendingSelection);
  const openNoteId = useAnnotationsStore((state) => state.openNoteId);
  const setPendingSelection = useAnnotationsStore(
    (state) => state.setPendingSelection,
  );
  const startNewNote = useAnnotationsStore((state) => state.startNewNote);

  if (!pendingSelection || openNoteId !== null) return null;

  const { rect } = pendingSelection;
  const top = rect.top > 60 ? rect.top - 52 : rect.bottom + 10;

  return (
    <div
      className="selection-toolbar"
      style={{ top, left: rect.left + rect.width / 2 }}
    >
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
