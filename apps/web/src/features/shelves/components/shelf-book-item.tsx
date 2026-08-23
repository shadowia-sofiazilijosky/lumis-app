"use client";

import type { BookSummary, Position } from "@lumis/shared-types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Lock, Unlock } from "lucide-react";
import type { CSSProperties } from "react";
import { DEFAULT_BOOK_COVER_SIZE } from "../lib/canvas";
import { useResizableBox } from "../hooks/use-resizable-box";
import { useShelfEditorStore } from "../store/shelf-editor-store";
import { ResizeHandles } from "./resize-handles";

const MIN_SIZE = 50;
const MAX_SIZE = 700;

interface ShelfBookItemProps {
  bookId: string;
  book: BookSummary;
  position: Position;
  onRemove: (bookId: string) => void;
}

export function ShelfBookItem({
  bookId,
  book,
  position,
  onRemove,
}: ShelfBookItemProps) {
  const isLocked = position.locked ?? false;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `book-${bookId}`,
      data: { kind: "book", bookId },
      disabled: isLocked,
    });

  const selectedBookId = useShelfEditorStore((state) => state.selectedBookId);
  const selectBook = useShelfEditorStore((state) => state.selectBook);
  const resizeBook = useShelfEditorStore((state) => state.resizeBook);
  const toggleBookLock = useShelfEditorStore((state) => state.toggleBookLock);
  const isSelected = selectedBookId === bookId;

  const width = position.width ?? DEFAULT_BOOK_COVER_SIZE.width;
  const height = position.height ?? DEFAULT_BOOK_COVER_SIZE.height;

  const { onPointerDown, onPointerMove, onPointerUp, liveOffset } = useResizableBox({
    width,
    height,
    minWidth: MIN_SIZE,
    maxWidth: MAX_SIZE,
    minHeight: MIN_SIZE,
    maxHeight: MAX_SIZE,
    onResize: (size) => resizeBook(bookId, size),
    onResizeEnd: (size) => resizeBook(bookId, size),
  });

  const wrapperStyle: CSSProperties = {
    position: "absolute",
    left: position.x,
    top: position.y,
    width,
    height,
    transform: `${transform ? CSS.Translate.toString(transform) : ""} translate(${liveOffset.x}px, ${liveOffset.y}px)`,
    zIndex: isDragging || isSelected ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      className="shelf-book-wrapper"
      style={wrapperStyle}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(event) => {
        event.stopPropagation();
        selectBook(isSelected ? null : bookId);
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

      {isSelected && (
        <>
          {!isLocked && <ResizeHandles onPointerDown={onPointerDown} />}
          <div className="shelf-item-actions" onPointerDown={(event) => event.stopPropagation()}>
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
        </>
      )}
    </div>
  );
}
