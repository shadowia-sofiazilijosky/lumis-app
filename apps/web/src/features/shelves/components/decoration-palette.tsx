"use client";

import { useDraggable } from "@dnd-kit/core";
import { DECORATION_CATALOG, type DecorationCatalogItem } from "../lib/decoration-catalog";

function PaletteItem({ type, variant, label, Icon }: DecorationCatalogItem) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}-${variant}`,
    data: { kind: "palette", type, variant },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      className="decoration-palette-item"
      style={{ opacity: isDragging ? 0.4 : 1 }}
      aria-label={`Agregar decoración: ${label}`}
    >
      <Icon />
      <span>{label}</span>
    </button>
  );
}

export function DecorationPalette() {
  return (
    <div className="decoration-palette" role="toolbar" aria-label="Decoraciones disponibles">
      {DECORATION_CATALOG.map((item) => (
        <PaletteItem key={`${item.type}-${item.variant}`} {...item} />
      ))}
    </div>
  );
}
