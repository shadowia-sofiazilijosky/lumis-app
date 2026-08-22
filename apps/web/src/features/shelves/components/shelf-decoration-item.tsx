"use client";

import type { ShelfDecoration } from "@lumis/shared-types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties } from "react";
import { DECORATION_ICONS } from "../lib/decoration-catalog";

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

  const Icon = DECORATION_ICONS[decoration.type]?.[decoration.variant ?? ""];
  const rotation = decoration.rotation ?? 0;

  const style: CSSProperties = {
    position: "absolute",
    left: decoration.x * scaleX,
    top: decoration.y * scaleY,
    transform: transform
      ? `${CSS.Translate.toString(transform)} rotate(${rotation}deg)`
      : `rotate(${rotation}deg)`,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div style={style} className="shelf-decoration-wrapper">
      <button
        ref={setNodeRef}
        type="button"
        {...listeners}
        {...attributes}
        className="shelf-decoration-item"
        aria-label={`Mover decoración: ${decoration.type}`}
      >
        {Icon ? <Icon /> : null}
      </button>
      <button
        type="button"
        className="shelf-decoration-remove"
        aria-label="Quitar decoración"
        onClick={() => onRemove(decoration.id)}
      >
        ×
      </button>
    </div>
  );
}
