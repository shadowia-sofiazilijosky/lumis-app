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
import { useMemo, useRef, useState } from "react";
import { removeBookFromShelf, updateShelf } from "../api/shelves-client";
import { CANVAS_HEIGHT, CANVAS_WIDTH, DEFAULT_SHELF_FRAME_SIZE } from "../lib/canvas";
import { findShelfFrameImage } from "../lib/appearance-catalog";
import { findDecorationDefaultSize, findDecorationImage } from "../lib/decoration-catalog";
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
  canvasScale: number;
}

function DroppableCanvas({
  shelf,
  bookPositions,
  decorations,
  onRemoveDecoration,
  onRemoveBook,
  editMode,
  canvasScale,
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
            canvasScale={canvasScale}
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
            canvasScale={canvasScale}
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

  // The canvas is always a fixed logical pixel size (the shelf's saved
  // canvasWidth/canvasHeight, or the 1000x600 default) -- every book,
  // decoration and frame is positioned as a plain offset in that same fixed
  // space. That's what makes the shelves-list card preview able to mirror
  // this exactly via percentages: it uses this identical reference size.
  // Older code let the canvas visually fill its container before it had
  // ever been manually resized (canvasWidth/Height still null), which felt
  // nice but meant items got positioned relative to whatever width the
  // container happened to be at the time -- not reproducible anywhere else.
  // Any leftover fit-to-screen need is handled purely visually below, via
  // `zoom`, without touching this logical coordinate system at all.
  const [canvasSize, setCanvasSize] = useState({
    width: shelf.canvasWidth ?? CANVAS_WIDTH,
    height: shelf.canvasHeight ?? CANVAS_HEIGHT,
  });
  const effectiveWidth = canvasSize.width;
  const effectiveHeight = canvasSize.height;

  const boxRef = useRef<HTMLDivElement>(null);
  const { ref: outerRef, size: outerSize } = useObservedSize<HTMLDivElement>();

  // Scales the whole canvas down (never up) to fit whatever width is
  // actually available, instead of overflowing into a scrollbar -- see the
  // `zoom` usage below for why this is a CSS zoom factor, not a transform.
  const canvasScale =
    outerSize.width > 0 ? Math.min(1, outerSize.width / effectiveWidth) : 1;

  // Pointer deltas (drag movement, resize-handle drag) arrive in real screen
  // pixels, but everything they move lives inside the `zoom`-scaled wrapper
  // above -- convert back to this canvas's own logical pixels before storing
  // any position/size, or every drag would move faster/slower than the
  // cursor whenever the canvas is scaled down.
  function toLogical(screenDelta: number) {
    return screenDelta / canvasScale;
  }

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
        x: current.x + toLogical(delta.x),
        y: current.y + toLogical(delta.y),
        rotation: current.rotation,
      });
      return;
    }

    if (data.kind === "decoration") {
      const current = decorations.find((d) => d.id === data.decorationId);
      if (!current) return;
      moveDecoration(data.decorationId, {
        x: current.x + toLogical(delta.x),
        y: current.y + toLogical(delta.y),
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
        x: Math.max(0, toLogical(draggedRect.left - canvasRect.left)),
        y: Math.max(0, toLogical(draggedRect.top - canvasRect.top)),
        ...(data.type === "shelf"
          ? DEFAULT_SHELF_FRAME_SIZE
          : (findDecorationDefaultSize(data.type, data.variant) ?? {})),
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

  const activeDecorationImage =
    activeDrag?.kind === "palette"
      ? findDecorationImage(activeDrag.type, activeDrag.variant)
      : activeDrag?.kind === "decoration" && activeDecoration
        ? findDecorationImage(activeDecoration.type, activeDecoration.variant ?? null)
        : null;

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
          <div className="shelf-canvas-outer" ref={outerRef}>
            <div
              className="shelf-canvas-scale-wrapper"
              // `zoom` (not `transform: scale`) on purpose: transform only
              // rescales an already-rasterized layer, which softened every
              // book cover and decoration image on any manually-resized
              // shelf that didn't fit the viewport. `zoom` reflows the
              // subtree at its true final size instead, so everything
              // (including <img> decode resolution) stays crisp.
              style={canvasScale < 1 ? { zoom: canvasScale } : undefined}
            >
              <ResizableCanvasBox
                width={effectiveWidth}
                height={effectiveHeight}
                scale={canvasScale}
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
                  canvasScale={canvasScale}
                />
              </ResizableCanvasBox>
            </div>
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
          ) : activeDecorationImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- local static asset
            <img src={activeDecorationImage} alt="" className="shelf-frame-drag-preview" />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
