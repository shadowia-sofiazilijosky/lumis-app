"use client";

import { useDraggable } from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import {
  DECORATION_CATALOG,
  type DecorationCatalogItem,
  type DecorationCategory,
} from "../lib/decoration-catalog";

function PaletteItem({ type, variant, imageUrl }: DecorationCatalogItem) {
  const t = useTranslations("shelfEditor.decoration");
  const label = t(`items.${type}-${variant}`);
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
      aria-label={t("addAria", { label })}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local static asset, tiny palette thumbnail */}
      <img src={imageUrl} alt="" className="decoration-palette-item-image" />
      <span>{label}</span>
    </button>
  );
}

export function DecorationPalette({
  category = "Todo",
}: {
  category?: DecorationCategory;
}) {
  const t = useTranslations("shelfEditor.decoration");
  const items =
    category === "Todo"
      ? DECORATION_CATALOG
      : DECORATION_CATALOG.filter((item) => item.category === category);

  return (
    <div className="decoration-palette" role="toolbar" aria-label={t("toolbarLabel")}>
      {items.length === 0 ? (
        <p className="decoration-palette-empty">{t("empty")}</p>
      ) : (
        items.map((item) => <PaletteItem key={`${item.type}-${item.variant}`} {...item} />)
      )}
    </div>
  );
}
