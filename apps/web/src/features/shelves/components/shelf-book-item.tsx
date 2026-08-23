"use client";

import type { BookSummary, Position } from "@lumis/shared-types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties } from "react";
import { useShelfEditorStore } from "../store/shelf-editor-store";

interface ShelfBookItemProps {
  bookId: string;
  book: BookSummary;
  position: Position;
  scaleX: number;
  scaleY: number;
}

export function ShelfBookItem({
  bookId,
  book,
  position,
  scaleX,
  scaleY,
}: ShelfBookItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `book-${bookId}`,
      data: { kind: "book", bookId },
    });

  const selectedBookId = useShelfEditorStore((state) => state.selectedBookId);
  const selectBook = useShelfEditorStore((state) => state.selectBook);
  const isSelected = selectedBookId === bookId;

  const wrapperStyle: CSSProperties = {
    position: "absolute",
    left: position.x * scaleX,
    top: position.y * scaleY,
    zIndex: isDragging || isSelected ? 10 : 1,
  };

  const bookStyle: CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
  };

  return (
    <div ref={setNodeRef} className="shelf-book-wrapper" style={wrapperStyle}>
      <button
        type="button"
        style={bookStyle}
        {...listeners}
        {...attributes}
        onClick={() => selectBook(isSelected ? null : bookId)}
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
    </div>
  );
}
