"use client";

import { useEffect, useState } from "react";
import {
  HIGHLIGHT_COLOR_HEX,
  createNote,
  deleteNote,
  updateNote,
} from "../api/annotations-client";
import { useAnnotationsStore } from "../store/annotations-store";

const NOTE_COLORS = Object.keys(HIGHLIGHT_COLOR_HEX);

/** Post-it editor: composes a new note from the pending selection, or edits/deletes an existing one. */
export function NotePopover({ bookId }: { bookId: string }) {
  const openNoteId = useAnnotationsStore((state) => state.openNoteId);
  const openNoteRect = useAnnotationsStore((state) => state.openNoteRect);
  const pendingSelection = useAnnotationsStore((state) => state.pendingSelection);
  const notes = useAnnotationsStore((state) => state.notes);
  const addNote = useAnnotationsStore((state) => state.addNote);
  const updateNoteLocal = useAnnotationsStore((state) => state.updateNoteLocal);
  const removeNoteLocal = useAnnotationsStore((state) => state.removeNoteLocal);
  const closeNotePopover = useAnnotationsStore((state) => state.closeNotePopover);

  const isNew = openNoteId === "new";
  const existingNote = !isNew
    ? notes.find((note) => note.id === openNoteId)
    : undefined;

  const [body, setBody] = useState(existingNote?.body ?? "");
  const [colorTag, setColorTag] = useState(existingNote?.colorTag ?? "YELLOW");
  const [saving, setSaving] = useState(false);

  // NotePopover stays mounted across opens — reset the editor whenever a
  // *different* note (or a fresh "new" compose) opens, since useState's
  // initial value only applies on first mount, not on subsequent opens.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setBody(existingNote?.body ?? "");
    setColorTag(existingNote?.colorTag ?? "YELLOW");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on openNoteId only: a new id/"new" is exactly the reset trigger
  }, [openNoteId]);

  if (openNoteId === null) return null;
  if (isNew && !pendingSelection) return null;
  if (!isNew && !existingNote) return null;

  const rect = isNew ? pendingSelection!.rect : openNoteRect!;
  const top = rect.top > 140 ? rect.top - 130 : rect.bottom + 10;

  async function handleSave() {
    if (!body.trim()) return;
    setSaving(true);
    try {
      if (isNew && pendingSelection) {
        const note = await createNote(bookId, {
          pageIndex: pendingSelection.pageIndex,
          offset: pendingSelection.startOffset,
          body: body.trim(),
          colorTag,
          ...(pendingSelection.cfi && { cfi: pendingSelection.cfi }),
        });
        if (note) addNote(note);
      } else if (existingNote) {
        const note = await updateNote(bookId, existingNote.id, {
          body: body.trim(),
          colorTag,
        });
        if (note) updateNoteLocal(existingNote.id, note);
      }
      closeNotePopover();
      window.getSelection()?.removeAllRanges();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existingNote) return;
    setSaving(true);
    try {
      await deleteNote(bookId, existingNote.id);
      removeNoteLocal(existingNote.id);
      closeNotePopover();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="note-popover" style={{ top, left: rect.left }}>
      <div className="note-popover-colors">
        {NOTE_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={color === colorTag ? "note-color-active" : ""}
            style={{ background: HIGHLIGHT_COLOR_HEX[color] }}
            aria-label={color.toLowerCase()}
            onClick={() => setColorTag(color)}
          />
        ))}
      </div>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Escribí tu nota…"
        rows={4}
        autoFocus
      />
      <div className="note-popover-actions">
        {existingNote && (
          <button type="button" className="secondary" onClick={handleDelete} disabled={saving}>
            Borrar
          </button>
        )}
        <button type="button" className="secondary" onClick={closeNotePopover} disabled={saving}>
          Cancelar
        </button>
        <button type="button" onClick={handleSave} disabled={saving || !body.trim()}>
          Guardar
        </button>
      </div>
    </div>
  );
}
