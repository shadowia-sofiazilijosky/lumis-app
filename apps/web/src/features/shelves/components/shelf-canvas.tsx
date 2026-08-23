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
import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { removeBookFromShelf, updateShelf } from "../api/shelves-client";
import { CANVAS_HEIGHT, CANVAS_WIDTH, DEFAULT_SHELF_FRAME_SIZE } from "../lib/canvas";
import { findShelfFrameImage } from "../lib/appearance-catalog";
import { DECORATION_ICONS } from "../lib/decoration-catalog";
import { useObservedSize } from "../hooks/use-observed-size";
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
  bookPositions: Record<string, { x: number; y: number; rotation?: number }>;
  decorations: ShelfDecoration[];
  onRemoveDecoration: (id: string) => void;
  onRemoveBook: (bookId: string) => void;
  editMode: boolean;
}

function DroppableCanvas({
  shelf,
  bookPositions,
  decorations,
  onRemoveDecoration,
  onRemoveBook,
  editMode,
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
            onRemove={onRemoveDecoration}
            editMode={editMode}
          />
        ))}

      {shelf.books.map((entry) => (
        <ShelfBookItem
          key={entry.bookId}
          bookId={entry.bookId}
          book={entry.book}
          position={bookPositions[entry.bookId] ?? { x: 0, y: 0 }}
          onRemove={onRemoveBook}
          editMode={editMode}
        />
      ))}

      {decorations
        .filter((decoration) => decoration.type !== "shelf")
        .map((decoration) => (
          <ShelfDecorationItem
            key={decoration.id}
            decoration={decoration}
            onRemove={onRemoveDecoration}
            editMode={editMode}
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
  const removeBookLocally = useShelfEditorStore(
    (state) => state.removeBookLocally,
  );
  const patchShelfMeta = useShelfEditorStore((state) => state.patchShelfMeta);
  const editMode = useShelfEditorStore((state) => state.editMode);
  const setEditMode = useShelfEditorStore((state) => state.setEditMode);

  const hasManualSize = shelf.canvasWidth != null && shelf.canvasHeight != null;
  const [canvasSize, setCanvasSize] = useState({
    width: shelf.canvasWidth ?? CANVAS_WIDTH,
    height: shelf.canvasHeight ?? CANVAS_HEIGHT,
  });
  const { ref: boxRef, size: observedSize } = useObservedSize<HTMLDivElement>();

  // Until the user resizes it manually, the canvas is CSS-driven (fills its
  // container responsively — grows when the sidebar collapses, etc.), so we
  // read its actual rendered size back via ResizeObserver — used only to size
  // the container box itself. Placed items (books/decorations/frames) are
  // positioned and sized in real canvas pixels and never scale with it: when
  // the box grows, it just reveals more empty space instead of stretching
  // whatever's already on it out of shape.
  const effectiveWidth = hasManualSize ? canvasSize.width : observedSize.width || CANVAS_WIDTH;
  const effectiveHeight = hasManualSize ? canvasSize.height : observedSize.height || CANVAS_HEIGHT;

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

  function handleRemoveBook(bookId: string) {
    removeBookLocally(bookId);
    removeBookFromShelf(shelf.id, bookId).catch(() => {});
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null);
    if (!editMode) return;

    const { active, over, delta } = event;
    const data = active.data.current as DragData | undefined;
    if (!data) return;

    if (data.kind === "book") {
      const current = bookPositions[data.bookId] ?? { x: 0, y: 0 };
      moveBook(data.bookId, {
        x: current.x + delta.x,
        y: current.y + delta.y,
        rotation: current.rotation,
      });
      return;
    }

    if (data.kind === "decoration") {
      const current = decorations.find((d) => d.id === data.decorationId);
      if (!current) return;
      moveDecoration(data.decorationId, {
        x: current.x + delta.x,
        y: current.y + delta.y,
        rotation: current.rotation,
      });
      return;
    }

    if (data.kind === "palette" && over?.id === "shelf-canvas") {
      const canvasRect = boxRef.current?.getBoundingClientRect();
      const draggedRect = active.rect.current.translated;
      if (!canvasRect || !draggedRect) return;

      addDecoration({
        id: crypto.randomUUID(),
        type: data.type,
        variant: data.variant,
        x: Math.max(0, draggedRect.left - canvasRect.left),
        y: Math.max(0, draggedRect.top - canvasRect.top),
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
        <div className="shelf-canvas-toolbar">
          <button
            type="button"
            className="shelf-toolbar-edit-button"
            onClick={() => setEditMode(!editMode)}
            aria-pressed={editMode}
          >
            <Pencil size={16} />
            Editar
          </button>
        </div>

        <div className="shelf-editor-layout">
          <div className="shelf-canvas-outer">
            <ResizableCanvasBox
              width={effectiveWidth}
              height={effectiveHeight}
              auto={!hasManualSize}
              aspectRatio={CANVAS_WIDTH / CANVAS_HEIGHT}
              boxRef={boxRef}
              onResize={setCanvasSize}
              onResizeEnd={persistCanvasSize}
              showHandles={editMode}
            >
              <DroppableCanvas
                shelf={shelf}
                bookPositions={bookPositions}
                decorations={decorations}
                onRemoveDecoration={removeDecoration}
                onRemoveBook={handleRemoveBook}
                editMode={editMode}
              />
            </ResizableCanvasBox>
          </div>
          {editMode && <ShelfCustomizationPanel shelf={shelf} />}
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
