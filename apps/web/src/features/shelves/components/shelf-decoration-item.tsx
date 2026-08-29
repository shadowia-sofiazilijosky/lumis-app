"use client";

import type { ShelfDecoration } from "@lumis/shared-types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Lock, Unlock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { findShelfFrameImage } from "../lib/appearance-catalog";
import { DEFAULT_DECORATION_SIZE, DEFAULT_SHELF_FRAME_SIZE } from "../lib/canvas";
import { findDecorationDefaultSize, findDecorationImage } from "../lib/decoration-catalog";
import { useResizableBox } from "../hooks/use-resizable-box";
import { useShelfEditorStore } from "../store/shelf-editor-store";
import { ResizeHandles } from "./resize-handles";

const MIN_SIZE = 24;
const MAX_SIZE = 900;

interface ShelfDecorationItemProps {
  decoration: ShelfDecoration;
  onRemove: (id: string) => void;
  editMode: boolean;
}

export function ShelfDecorationItem({
  decoration,
  onRemove,
  editMode,
}: ShelfDecorationItemProps) {
  const t = useTranslations("shelfEditor.item");
  const isLocked = decoration.locked ?? false;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `decoration-${decoration.id}`,
      data: { kind: "decoration", decorationId: decoration.id },
      disabled: isLocked || !editMode,
    });

  const selectedDecorationId = useShelfEditorStore(
    (state) => state.selectedDecorationId,
  );
  const selectDecoration = useShelfEditorStore((state) => state.selectDecoration);
  const resizeDecoration = useShelfEditorStore((state) => state.resizeDecoration);
  const toggleDecorationLock = useShelfEditorStore(
    (state) => state.toggleDecorationLock,
  );

  const isShelfFrame = decoration.type === "shelf";
  const defaultSize = isShelfFrame
    ? DEFAULT_SHELF_FRAME_SIZE
    : (findDecorationDefaultSize(decoration.type, decoration.variant ?? null) ??
      DEFAULT_DECORATION_SIZE);
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

  const decorationImage = isShelfFrame
    ? null
    : findDecorationImage(decoration.type, decoration.variant ?? null);
  const frameImage = isShelfFrame ? findShelfFrameImage(decoration.variant ?? null) : null;
  const rotation = decoration.rotation ?? 0;

  const wrapperStyle: CSSProperties = {
    position: "absolute",
    left: decoration.x,
    top: decoration.y,
    width,
    height,
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
        if (editMode) selectDecoration(isSelected ? null : decoration.id);
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
        aria-label={
          isShelfFrame
            ? t("moveShelf", { type: decoration.type })
            : t("moveDecoration", { type: decoration.type })
        }
        aria-pressed={isSelected}
      >
        {frameImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- local static asset, dimensions vary with the box
          <img src={frameImage} alt="" className="shelf-decoration-frame-image" />
        ) : decorationImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- local static asset, dimensions vary with the box
          <img src={decorationImage} alt="" className="shelf-decoration-item-image" />
        ) : null}
      </button>

      {isSelected && editMode && (
        <>
          {!isLocked && <ResizeHandles onPointerDown={onPointerDown} />}
          <div className="shelf-item-actions" onPointerDown={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="shelf-item-action"
              aria-label={isLocked ? t("unpin") : t("pin")}
              onClick={(event) => {
                event.stopPropagation();
                toggleDecorationLock(decoration.id);
              }}
            >
              {isLocked ? <Unlock size={13} /> : <Lock size={13} />}
            </button>
            <button
              type="button"
              className="shelf-item-action shelf-item-action-danger"
              aria-label={t("remove")}
              onClick={(event) => {
                event.stopPropagation();
                onRemove(decoration.id);
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
