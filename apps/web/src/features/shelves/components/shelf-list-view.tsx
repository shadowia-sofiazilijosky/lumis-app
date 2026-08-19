"use client";

import type { ShelfWithBooks } from "@lumis/shared-types";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../lib/canvas";
import { useShelfEditorStore } from "../store/shelf-editor-store";

const NUDGE_STEP = 20;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface NudgeControlsProps {
  label: string;
  onNudge: (dx: number, dy: number) => void;
}

function NudgeControls({ label, onNudge }: NudgeControlsProps) {
  return (
    <div className="nudge-controls" role="group" aria-label={`Mover ${label}`}>
      <button type="button" onClick={() => onNudge(0, -NUDGE_STEP)} aria-label="Mover arriba">
        <ArrowUp size={14} />
      </button>
      <button type="button" onClick={() => onNudge(0, NUDGE_STEP)} aria-label="Mover abajo">
        <ArrowDown size={14} />
      </button>
      <button
        type="button"
        onClick={() => onNudge(-NUDGE_STEP, 0)}
        aria-label="Mover a la izquierda"
      >
        <ArrowLeft size={14} />
      </button>
      <button
        type="button"
        onClick={() => onNudge(NUDGE_STEP, 0)}
        aria-label="Mover a la derecha"
      >
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

/** Accessible alternative to the drag-and-drop canvas — same data, keyboard/screen-reader friendly. */
export function ShelfListView({ shelf }: { shelf: ShelfWithBooks }) {
  const bookPositions = useShelfEditorStore((state) => state.bookPositions);
  const decorations = useShelfEditorStore((state) => state.decorations);
  const moveBook = useShelfEditorStore((state) => state.moveBook);
  const moveDecoration = useShelfEditorStore((state) => state.moveDecoration);
  const removeDecoration = useShelfEditorStore(
    (state) => state.removeDecoration,
  );

  function nudgeBook(bookId: string, dx: number, dy: number) {
    const current = bookPositions[bookId] ?? { x: 0, y: 0 };
    moveBook(bookId, {
      x: clamp(current.x + dx, 0, CANVAS_WIDTH),
      y: clamp(current.y + dy, 0, CANVAS_HEIGHT),
      rotation: current.rotation,
    });
  }

  function nudgeDecoration(id: string, dx: number, dy: number) {
    const current = decorations.find((decoration) => decoration.id === id);
    if (!current) return;
    moveDecoration(id, {
      x: clamp(current.x + dx, 0, CANVAS_WIDTH),
      y: clamp(current.y + dy, 0, CANVAS_HEIGHT),
      rotation: current.rotation,
    });
  }

  return (
    <div className="shelf-list-view">
      <h2>Libros en esta estantería</h2>
      {shelf.books.length === 0 && <p>Todavía no hay libros acá.</p>}
      <ul>
        {shelf.books.map((entry) => (
          <li key={entry.bookId}>
            <span>{entry.book.title}</span>
            <NudgeControls
              label={entry.book.title}
              onNudge={(dx, dy) => nudgeBook(entry.bookId, dx, dy)}
            />
          </li>
        ))}
      </ul>

      <h2>Decoraciones</h2>
      {decorations.length === 0 && <p>Todavía no agregaste decoraciones.</p>}
      <ul>
        {decorations.map((decoration) => (
          <li key={decoration.id}>
            <span>
              {decoration.type} — {decoration.variant}
            </span>
            <NudgeControls
              label={decoration.type}
              onNudge={(dx, dy) => nudgeDecoration(decoration.id, dx, dy)}
            />
            <button type="button" onClick={() => removeDecoration(decoration.id)}>
              Quitar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
