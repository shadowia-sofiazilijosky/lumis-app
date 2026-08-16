"use client";

import type { BookSummary, Position, ShelfArrangement } from "@lumis/shared-types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties } from "react";

interface ShelfBookItemProps {
  bookId: string;
  book: BookSummary;
  position: Position;
  scale: number;
  arrangement: ShelfArrangement;
}

export function ShelfBookItem({
  bookId,
  book,
  position,
  scale,
  arrangement,
}: ShelfBookItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `book-${bookId}`,
      data: { kind: "book", bookId },
    });

  const rotation = position.rotation ?? 0;
  const style: CSSProperties = {
    position: "absolute",
    left: position.x * scale,
    top: position.y * scale,
    transform: transform
      ? `${CSS.Translate.toString(transform)} rotate(${rotation}deg)`
      : `rotate(${rotation}deg)`,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      {...listeners}
      {...attributes}
      className={
        arrangement === "SPINE" ? "shelf-book-spine" : "shelf-book-cover"
      }
      aria-label={`Mover "${book.title}"`}
    >
      {arrangement === "SPINE" ? (
        <span className="shelf-book-spine-title">{book.title}</span>
      ) : book.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived Supabase URL
        <img src={book.coverUrl} alt="" />
      ) : (
        <span className="shelf-book-cover-fallback">{book.title}</span>
      )}
    </button>
  );
}
