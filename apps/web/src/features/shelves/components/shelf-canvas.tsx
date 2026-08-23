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
import { useMemo, useRef, useState } from "react";
import { updateShelf } from "../api/shelves-client";
import { CANVAS_HEIGHT, CANVAS_WIDTH, DEFAULT_SHELF_FRAME_SIZE } from "../lib/canvas";
import { findShelfFrameImage } from "../lib/appearance-catalog";
import { DECORATION_ICONS } from "../lib/decoration-catalog";
import { useShelfEditorStore } from "../store/shelf-editor-store";
import { ResizableCanvasBox } from "./resizable-canvas-box";
import { ShelfBookItem } from "./shelf-book-item";
import { ShelfCustomizationPanel } from "./shelf-customization-panel";
import { ShelfDecorationItem } from "./shelf-decoration-item";

type DragData =
  | { kind: "book"; bookId: string }
  | { kind: "decoration"; decorationId: string }
  | { kind: "palette"; type: string; variant: string };

interface DroppableCanvasProps {
  shelf: ShelfWithBooks;
  scaleX: number;
  scaleY: number;
  bookPositions: Record<string, { x: number; y: number; rotation?: number }>;
  decorations: ShelfDecoration[];
  onRemoveDecoration: (id: string) => void;
}

function DroppableCanvas({
  shelf,
  scaleX,
  scaleY,
  bookPositions,
  decorations,
  onRemoveDecoration,
}: DroppableCanvasProps) {
  const { setNodeRef } = useDroppable({ id: "shelf-canvas" });
  const selectBook = useShelfEditorStore((state) => state.selectBook);
  const selectDecoration = useShelfEditorStore((state) => state.selectDecoration);

  return (
    <div
      ref={setNodeRef}
      className="shelf-canvas-inner"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          selectBook(null);
          selectDecoration(null);
        }
      }}
    >
      {/* Wall/backdrop layer — the "Fondo" tab selection, always covers the
          full canvas box edge-to-edge, however large the box is resized. */}
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

      {/* Shelf-frame images act as backdrop furniture, so they render behind
          the books; other decorations (plants, lights, ...) render in front. */}
      {decorations
        .filter((decoration) => decoration.type === "shelf")
        .map((decoration) => (
          <ShelfDecorationItem
            key={decoration.id}
            decoration={decoration}
            scaleX={scaleX}
            scaleY={scaleY}
            onRemove={onRemoveDecoration}
          />
        ))}

      {shelf.books.map((entry) => (
        <ShelfBookItem
          key={entry.bookId}
          bookId={entry.bookId}
          book={entry.book}
          position={bookPositions[entry.bookId] ?? { x: 0, y: 0 }}
          scaleX={scaleX}
          scaleY={scaleY}
        />
      ))}

      {decorations
        .filter((decoration) => decoration.type !== "shelf")
        .map((decoration) => (
          <ShelfDecorationItem
            key={decoration.id}
            decoration={decoration}
            scaleX={scaleX}
            scaleY={scaleY}
            onRemove={onRemoveDecoration}
          />
        ))}
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
  const patchShelfMeta = useShelfEditorStore((state) => state.patchShelfMeta);

  const [canvasSize, setCanvasSize] = useState({
    width: shelf.canvasWidth ?? CANVAS_WIDTH,
    height: shelf.canvasHeight ?? CANVAS_HEIGHT,
  });
  const scaleX = canvasSize.width / CANVAS_WIDTH;
  const scaleY = canvasSize.height / CANVAS_HEIGHT;

  const containerRef = useRef<HTMLDivElement>(null);
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

  function persistCanvasSize(size: { width: number; height: number }) {
    patchShelfMeta({ canvasWidth: size.width, canvasHeight: size.height });
    updateShelf(shelf.id, {
      canvasWidth: size.width,
      canvasHeight: size.height,
    }).catch(() => {});
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null);
    const { active, over, delta } = event;
    const data = active.data.current as DragData | undefined;
    if (!data) return;

    if (data.kind === "book") {
      const current = bookPositions[data.bookId] ?? { x: 0, y: 0 };
      moveBook(data.bookId, {
        x: current.x + delta.x / scaleX,
        y: current.y + delta.y / scaleY,
        rotation: current.rotation,
      });
      return;
    }

    if (data.kind === "decoration") {
      const current = decorations.find((d) => d.id === data.decorationId);
      if (!current) return;
      moveDecoration(data.decorationId, {
        x: current.x + delta.x / scaleX,
        y: current.y + delta.y / scaleY,
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
        x: Math.max(0, (draggedRect.left - canvasRect.left) / scaleX),
        y: Math.max(0, (draggedRect.top - canvasRect.top) / scaleY),
        ...(data.type === "shelf" ? DEFAULT_SHELF_FRAME_SIZE : {}),
      });
    }
  }

  const activeFrameImage =
    activeDrag?.kind === "palette" && activeDrag.type === "shelf"
      ? findShelfFrameImage(activeDrag.variant)
      : activeDrag?.kind === "decoration" &&
          activeDecoration?.type === "shelf"
        ? findShelfFrameImage(activeDecoration.variant ?? null)
        : null;

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
          <div ref={containerRef} className="shelf-canvas-outer">
            <ResizableCanvasBox
              width={canvasSize.width}
              height={canvasSize.height}
              onResize={setCanvasSize}
              onResizeEnd={persistCanvasSize}
            >
              <DroppableCanvas
                shelf={shelf}
                scaleX={scaleX}
                scaleY={scaleY}
                bookPositions={bookPositions}
                decorations={decorations}
                onRemoveDecoration={removeDecoration}
              />
            </ResizableCanvasBox>
          </div>
          <ShelfCustomizationPanel shelf={shelf} />
        </div>
        <DragOverlay>
          {activeDrag?.kind === "book" && activeBookEntry ? (
            <div className="shelf-book-drag-preview">
              {activeBookEntry.book.title}
            </div>
          ) : activeFrameImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- local static asset
            <img src={activeFrameImage} alt="" className="shelf-frame-drag-preview" />
          ) : ActiveIcon ? (
            <ActiveIcon />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
