"use client";

import type { ShelfDecoration } from "@lumis/shared-types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties } from "react";
import { findShelfFrameImage } from "../lib/appearance-catalog";
import { DEFAULT_DECORATION_SIZE, DEFAULT_SHELF_FRAME_SIZE } from "../lib/canvas";
import { DECORATION_ICONS } from "../lib/decoration-catalog";
import { useResizableBox } from "../hooks/use-resizable-box";
import { useShelfEditorStore } from "../store/shelf-editor-store";
import { ResizeHandles } from "./resize-handles";

const MIN_SIZE = 24;
const MAX_SIZE = 900;

interface ShelfDecorationItemProps {
  decoration: ShelfDecoration;
  scaleX: number;
  scaleY: number;
  onRemove: (id: string) => void;
}

export function ShelfDecorationItem({
  decoration,
  scaleX,
  scaleY,
  onRemove,
}: ShelfDecorationItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `decoration-${decoration.id}`,
      data: { kind: "decoration", decorationId: decoration.id },
    });

  const selectedDecorationId = useShelfEditorStore(
    (state) => state.selectedDecorationId,
  );
  const selectDecoration = useShelfEditorStore((state) => state.selectDecoration);
  const resizeDecoration = useShelfEditorStore((state) => state.resizeDecoration);

  const isShelfFrame = decoration.type === "shelf";
  const defaultSize = isShelfFrame ? DEFAULT_SHELF_FRAME_SIZE : DEFAULT_DECORATION_SIZE;
  const width = decoration.width ?? defaultSize.width;
  const height = decoration.height ?? defaultSize.height;
  const isSelected = selectedDecorationId === decoration.id;

  const { onPointerDown, onPointerMove, onPointerUp, liveOffset } = useResizableBox({
    width,
    height,
    minWidth: MIN_SIZE,
    maxWidth: MAX_SIZE,
    minHeight: MIN_SIZE,
    maxHeight: MAX_SIZE,
    onResize: (size) => resizeDecoration(decoration.id, size),
    onResizeEnd: (size) => resizeDecoration(decoration.id, size),
  });

  const Icon = DECORATION_ICONS[decoration.type]?.[decoration.variant ?? ""];
  const frameImage = isShelfFrame ? findShelfFrameImage(decoration.variant ?? null) : null;
  const rotation = decoration.rotation ?? 0;

  const wrapperStyle: CSSProperties = {
    position: "absolute",
    left: decoration.x * scaleX,
    top: decoration.y * scaleY,
    width: width * scaleX,
    height: height * scaleY,
    transform: `${transform ? CSS.Translate.toString(transform) : ""} translate(${liveOffset.x}px, ${liveOffset.y}px) rotate(${rotation}deg)`,
    zIndex: isDragging || isSelected ? 10 : 1,
  };

  return (
    <div
      style={wrapperStyle}
      className="shelf-decoration-wrapper"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(event) => {
        event.stopPropagation();
        selectDecoration(isSelected ? null : decoration.id);
      }}
    >
      <button
        ref={setNodeRef}
        type="button"
        {...listeners}
        {...attributes}
        className={
          isShelfFrame ? "shelf-decoration-frame" : "shelf-decoration-item"
        }
        aria-label={`Mover ${isShelfFrame ? "estantería" : "decoración"}: ${decoration.type}`}
        aria-pressed={isSelected}
      >
        {frameImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- local static asset, dimensions vary with the box
          <img src={frameImage} alt="" className="shelf-decoration-frame-image" />
        ) : Icon ? (
          <Icon />
        ) : null}
      </button>

      {isSelected && (
        <>
          <ResizeHandles onPointerDown={onPointerDown} />
          <button
            type="button"
            className="shelf-decoration-remove"
            aria-label="Quitar"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onRemove(decoration.id);
            }}
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}
