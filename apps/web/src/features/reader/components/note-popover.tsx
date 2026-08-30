"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { NOTE_TAG_COLORS } from "@/features/notes/lib/note-tag-colors";
import { createNote, deleteNote, updateNote } from "../api/annotations-client";
import { useAnnotationsStore } from "../store/annotations-store";

const NOTE_COLORS = Object.keys(NOTE_TAG_COLORS);

/** Post-it editor: composes a new note from the pending selection, or edits/deletes an existing one. */
export function NotePopover({ bookId }: { bookId: string }) {
  const t = useTranslations("reader.note");
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

  // The parent gives this component `key={openNoteId}`, so it fully remounts
  // whenever a different note (or a fresh "new" compose) opens — these
  // initial values are never stale, no reset effect needed.
  const [body, setBody] = useState(existingNote?.body ?? "");
  const [colorTag, setColorTag] = useState(existingNote?.colorTag ?? "YELLOW");
  const [saving, setSaving] = useState(false);

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
            style={{ background: NOTE_TAG_COLORS[color] }}
            aria-label={color.toLowerCase()}
            onClick={() => setColorTag(color)}
          />
        ))}
      </div>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={t("placeholder")}
        rows={4}
        autoFocus
      />
      <div className="note-popover-actions">
        {existingNote && (
          <button type="button" className="secondary" onClick={handleDelete} disabled={saving}>
            {t("delete")}
          </button>
        )}
        <button type="button" className="secondary" onClick={closeNotePopover} disabled={saving}>
          {t("cancel")}
        </button>
        <button type="button" onClick={handleSave} disabled={saving || !body.trim()}>
          {t("save")}
        </button>
      </div>
    </div>
  );
}
