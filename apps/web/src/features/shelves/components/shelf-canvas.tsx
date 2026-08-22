"use client";

import type { ShelfDecoration, ShelfWithBooks } from "@lumis/shared-types";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../lib/canvas";
import { findShelfFrameImage } from "../lib/appearance-catalog";
import { DECORATION_ICONS } from "../lib/decoration-catalog";
import { useCanvasScale } from "../hooks/use-canvas-scale";
import { useShelfEditorStore } from "../store/shelf-editor-store";
import { ShelfBookItem } from "./shelf-book-item";
import { ShelfCustomizationPanel } from "./shelf-customization-panel";
import { ShelfDecorationItem } from "./shelf-decoration-item";

const DEFAULT_SHELF_COLOR = "#8c2f39";

type DragData =
  | { kind: "book"; bookId: string }
  | { kind: "decoration"; decorationId: string }
  | { kind: "palette"; type: string; variant: string };

interface DroppableCanvasProps {
  shelf: ShelfWithBooks;
  scale: number;
  bookPositions: Record<string, { x: number; y: number; rotation?: number }>;
  decorations: ShelfDecoration[];
  onRemoveDecoration: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function DroppableCanvas({
  shelf,
  scale,
  bookPositions,
  decorations,
  onRemoveDecoration,
  containerRef,
}: DroppableCanvasProps) {
  const { setNodeRef } = useDroppable({ id: "shelf-canvas" });
  const selectBook = useShelfEditorStore((state) => state.selectBook);
  const frameImage = findShelfFrameImage(shelf.shelfFrame);

  return (
    <div
      ref={containerRef}
      className="shelf-canvas-outer"
      style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
    >
      <div
        ref={setNodeRef}
        className="shelf-canvas-inner"
        style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale }}
        onClick={(event) => {
          if (event.target === event.currentTarget) selectBook(null);
        }}
      >
        {/* Wall/backdrop layer — the "Fondo" tab selection. */}
        <div
          className="shelf-background-layer"
          style={{
            backgroundColor: shelf.backgroundColor || undefined,
            backgroundImage: shelf.backgroundImageUrl
              ? `url(${shelf.backgroundImageUrl})`
              : undefined,
          }}
          aria-hidden="true"
        />

        {/* Furniture layer — a selected wood-frame image ("Estantería" tab)
            replaces the default texture entirely; otherwise the default
            grayscale texture is tinted via multiply blend with the chosen
            furniture color, keeping the wood grain/shadows visible. */}
        <div
          className="shelf-frame-layer"
          style={frameImage ? { backgroundImage: `url(${frameImage})` } : undefined}
          aria-hidden="true"
        >
          {!frameImage && (
            <div
              className="shelf-color-overlay"
              style={{ backgroundColor: shelf.shelfColor ?? DEFAULT_SHELF_COLOR }}
              aria-hidden="true"
            />
          )}
        </div>

        <div className="shelf-plank" aria-hidden="true" />

        {shelf.books.map((entry) => (
          <ShelfBookItem
            key={entry.bookId}
            shelfId={shelf.id}
            bookId={entry.bookId}
            book={entry.book}
            position={bookPositions[entry.bookId] ?? { x: 0, y: 0 }}
            scale={scale}
            arrangement={shelf.arrangement}
          />
        ))}

        {decorations.map((decoration) => (
          <ShelfDecorationItem
            key={decoration.id}
            decoration={decoration}
            scale={scale}
            onRemove={onRemoveDecoration}
          />
        ))}
      </div>
    </div>
  );
}

export function ShelfCanvas({ shelf }: { shelf: ShelfWithBooks }) {
  const bookPositions = useShelfEditorStore((state) => state.bookPositions);
  const decorations = useShelfEditorStore((state) => state.decorations);
  const moveBook = useShelfEditorStore((state) => state.moveBook);
  const moveDecoration = useShelfEditorStore((state) => state.moveDecoration);
  const addDecoration = useShelfEditorStore((state) => state.addDecoration);
  const removeDecoration = useShelfEditorStore(
    (state) => state.removeDecoration,
  );

  const { containerRef, scale } = useCanvasScale(CANVAS_WIDTH);
  const [activeDrag, setActiveDrag] = useState<DragData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  const activeDecoration = useMemo(
    () =>
      activeDrag?.kind === "decoration"
        ? decorations.find((d) => d.id === activeDrag.decorationId)
        : undefined,
    [activeDrag, decorations],
  );
  const activeBookEntry = useMemo(
    () =>
      activeDrag?.kind === "book"
        ? shelf.books.find((entry) => entry.bookId === activeDrag.bookId)
        : undefined,
    [activeDrag, shelf.books],
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveDrag((event.active.data.current as DragData | undefined) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null);
    const { active, over, delta } = event;
    const data = active.data.current as DragData | undefined;
    if (!data) return;

    if (data.kind === "book") {
      const current = bookPositions[data.bookId] ?? { x: 0, y: 0 };
      moveBook(data.bookId, {
        x: current.x + delta.x / scale,
        y: current.y + delta.y / scale,
        rotation: current.rotation,
      });
      return;
    }

    if (data.kind === "decoration") {
      const current = decorations.find((d) => d.id === data.decorationId);
      if (!current) return;
      moveDecoration(data.decorationId, {
        x: current.x + delta.x / scale,
        y: current.y + delta.y / scale,
        rotation: current.rotation,
      });
      return;
    }

    if (data.kind === "palette" && over?.id === "shelf-canvas") {
      const canvasRect = containerRef.current?.getBoundingClientRect();
      const draggedRect = active.rect.current.translated;
      if (!canvasRect || !draggedRect) return;

      addDecoration({
        id: crypto.randomUUID(),
        type: data.type,
        variant: data.variant,
        x: Math.max(0, (draggedRect.left - canvasRect.left) / scale),
        y: Math.max(0, (draggedRect.top - canvasRect.top) / scale),
      });
    }
  }

  const ActiveIcon =
    activeDrag?.kind === "palette"
      ? DECORATION_ICONS[activeDrag.type]?.[activeDrag.variant]
      : activeDrag?.kind === "decoration" && activeDecoration
        ? DECORATION_ICONS[activeDecoration.type]?.[
            activeDecoration.variant ?? ""
          ]
        : undefined;

  return (
    <div className="shelf-editor">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveDrag(null)}
      >
        <div className="shelf-editor-layout">
          <DroppableCanvas
            shelf={shelf}
            scale={scale}
            bookPositions={bookPositions}
            decorations={decorations}
            onRemoveDecoration={removeDecoration}
            containerRef={containerRef}
          />
          <ShelfCustomizationPanel shelf={shelf} />
        </div>
        <DragOverlay>
          {activeDrag?.kind === "book" && activeBookEntry ? (
            <div className="shelf-book-drag-preview">
              {activeBookEntry.book.title}
            </div>
          ) : ActiveIcon ? (
            <ActiveIcon />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
