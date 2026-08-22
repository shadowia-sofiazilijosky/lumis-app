"use client";

import type { BookSummary, Position, ShelfArrangement } from "@lumis/shared-types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useRef, type ChangeEvent, type CSSProperties } from "react";
import { uploadSpineImage } from "../api/shelves-client";
import { useShelfEditorStore } from "../store/shelf-editor-store";

interface ShelfBookItemProps {
  shelfId: string;
  bookId: string;
  book: BookSummary;
  position: Position;
  scaleX: number;
  scaleY: number;
  arrangement: ShelfArrangement;
}

export function ShelfBookItem({
  shelfId,
  bookId,
  book,
  position,
  scaleX,
  scaleY,
  arrangement,
}: ShelfBookItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `book-${bookId}`,
      data: { kind: "book", bookId },
    });

  const selectedBookId = useShelfEditorStore((state) => state.selectedBookId);
  const selectBook = useShelfEditorStore((state) => state.selectBook);
  const setBookRotation = useShelfEditorStore((state) => state.setBookRotation);
  const setBookCustomSpineImage = useShelfEditorStore(
    (state) => state.setBookCustomSpineImage,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSelected = selectedBookId === bookId;
  const rotation = position.rotation ?? 0;

  const wrapperStyle: CSSProperties = {
    position: "absolute",
    left: position.x * scaleX,
    top: position.y * scaleY,
    zIndex: isDragging || isSelected ? 10 : 1,
  };

  const bookStyle: CSSProperties = {
    transform: transform
      ? `${CSS.Translate.toString(transform)} rotate(${rotation}deg)`
      : `rotate(${rotation}deg)`,
  };

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const result = await uploadSpineImage(shelfId, bookId, file).catch(
      () => null,
    );
    if (result) {
      setBookCustomSpineImage(
        bookId,
        result.customSpineImageKey,
        result.customSpineImageUrl,
      );
    }
  }

  return (
    <div ref={setNodeRef} className="shelf-book-wrapper" style={wrapperStyle}>
      <button
        type="button"
        style={bookStyle}
        {...listeners}
        {...attributes}
        onClick={() => selectBook(isSelected ? null : bookId)}
        className={
          arrangement === "SPINE" ? "shelf-book-spine" : "shelf-book-cover"
        }
        aria-label={`Seleccionar o mover "${book.title}"`}
        aria-pressed={isSelected}
      >
        {position.customSpineImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived Supabase URL
          <img
            src={position.customSpineImageUrl}
            alt=""
            className="shelf-book-custom-image"
          />
        ) : arrangement === "SPINE" ? (
          <span className="shelf-book-spine-title">{book.title}</span>
        ) : book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived Supabase URL
          <img src={book.coverUrl} alt="" />
        ) : (
          <span className="shelf-book-cover-fallback">{book.title}</span>
        )}
      </button>

      {isSelected && (
        <div className="shelf-book-toolbar" onPointerDown={(e) => e.stopPropagation()}>
          <label className="shelf-book-toolbar-rotation">
            Rotación
            <input
              type="range"
              min={-45}
              max={45}
              value={rotation}
              onChange={(event) =>
                setBookRotation(bookId, Number(event.target.value))
              }
            />
          </label>
          <button
            type="button"
            className="shelf-book-toolbar-upload"
            onClick={() => fileInputRef.current?.click()}
          >
            Subir foto del lomo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            hidden
            onChange={handlePhotoChange}
          />
        </div>
      )}
    </div>
  );
}
