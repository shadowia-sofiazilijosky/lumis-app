"use client";

import type { BookSummary, Position } from "@lumis/shared-types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Lock, Unlock } from "lucide-react";
import type { CSSProperties } from "react";
import { DEFAULT_BOOK_COVER_SIZE } from "../lib/canvas";
import { useShelfEditorStore } from "../store/shelf-editor-store";

interface ShelfBookItemProps {
  bookId: string;
  book: BookSummary;
  position: Position;
  onRemove: (bookId: string) => void;
  editMode: boolean;
}

export function ShelfBookItem({
  bookId,
  book,
  position,
  onRemove,
  editMode,
}: ShelfBookItemProps) {
  const isLocked = position.locked ?? false;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `book-${bookId}`,
      data: { kind: "book", bookId },
      disabled: isLocked || !editMode,
    });

  const selectedBookId = useShelfEditorStore((state) => state.selectedBookId);
  const selectBook = useShelfEditorStore((state) => state.selectBook);
  const toggleBookLock = useShelfEditorStore((state) => state.toggleBookLock);
  const isSelected = selectedBookId === bookId;

  // Covers keep a fixed, real size on the shelf — no per-book resizing.
  const { width, height } = DEFAULT_BOOK_COVER_SIZE;

  const wrapperStyle: CSSProperties = {
    position: "absolute",
    left: position.x,
    top: position.y,
    width,
    height,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    zIndex: isDragging || isSelected ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      className="shelf-book-wrapper"
      style={wrapperStyle}
      onClick={(event) => {
        event.stopPropagation();
        if (editMode) selectBook(isSelected ? null : bookId);
      }}
    >
      <button
        type="button"
        {...listeners}
        {...attributes}
        className="shelf-book-cover"
        aria-label={`Seleccionar o mover "${book.title}"`}
        aria-pressed={isSelected}
      >
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived Supabase URL
          <img src={book.coverUrl} alt="" />
        ) : (
          <span className="shelf-book-cover-fallback">{book.title}</span>
        )}
      </button>

      {isSelected && editMode && (
        <div
          className="shelf-item-actions"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="shelf-item-action"
            aria-label={isLocked ? "Desfijar" : "Fijar"}
            onClick={(event) => {
              event.stopPropagation();
              toggleBookLock(bookId);
            }}
          >
            {isLocked ? <Unlock size={13} /> : <Lock size={13} />}
          </button>
          <button
            type="button"
            className="shelf-item-action shelf-item-action-danger"
            aria-label="Quitar de la estantería"
            onClick={(event) => {
              event.stopPropagation();
              onRemove(bookId);
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
