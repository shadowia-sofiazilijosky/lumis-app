"use client";

import type { BookSummary } from "@lumis/shared-types";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { BookCard } from "./book-card";

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function DraggableBookCard({
  book,
  isDragging,
}: {
  book: BookSummary;
  isDragging: boolean;
}) {
  const { attributes, listeners, setNodeRef: setDragRef } = useDraggable({
    id: book.id,
  });
  const { setNodeRef: setDropRef } = useDroppable({ id: book.id });

  return (
    <div
      ref={(node) => {
        setDragRef(node);
        setDropRef(node);
      }}
      {...attributes}
      {...listeners}
      className="book-grid-item"
      style={{ opacity: isDragging ? 0.4 : 1, touchAction: "none" }}
    >
      <BookCard book={book} />
    </div>
  );
}

export function BookGrid({
  books,
  onReorder,
}: {
  books: BookSummary[];
  onReorder: (books: BookSummary[]) => void;
}) {
  const t = useTranslations("library");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = books.findIndex((book) => book.id === active.id);
    const toIndex = books.findIndex((book) => book.id === over.id);
    if (fromIndex === -1 || toIndex === -1) return;

    onReorder(moveItem(books, fromIndex, toIndex));
  }

  if (books.length === 0) {
    return <p>{t("empty")}</p>;
  }

  const activeBook = books.find((book) => book.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="book-grid">
        {books.map((book) => (
          <DraggableBookCard
            key={book.id}
            book={book}
            isDragging={activeId === book.id}
          />
        ))}
      </div>
      <DragOverlay>
        {activeBook ? (
          <div className="book-grid-item book-grid-item-overlay">
            <BookCard book={activeBook} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
