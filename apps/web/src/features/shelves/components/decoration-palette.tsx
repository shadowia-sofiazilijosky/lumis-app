"use client";

import { useDraggable } from "@dnd-kit/core";
import {
  DECORATION_CATALOG,
  type DecorationCatalogItem,
  type DecorationCategory,
} from "../lib/decoration-catalog";

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

export function DecorationPalette({
  category = "Todo",
}: {
  category?: DecorationCategory;
}) {
  const items =
    category === "Todo"
      ? DECORATION_CATALOG
      : DECORATION_CATALOG.filter((item) => item.category === category);

  return (
    <div className="decoration-palette" role="toolbar" aria-label="Decoraciones disponibles">
      {items.length === 0 ? (
        <p className="decoration-palette-empty">
          Todavía no hay decoraciones en esta categoría.
        </p>
      ) : (
        items.map((item) => <PaletteItem key={`${item.type}-${item.variant}`} {...item} />)
      )}
    </div>
  );
}
