"use client";

import type { ShelfWithBooks, UpdateShelfInput } from "@lumis/shared-types";
import { useDraggable } from "@dnd-kit/core";
import { Check } from "lucide-react";
import { useState } from "react";
import {
  BACKGROUND_OPTIONS,
  SHELF_FRAME_OPTIONS,
  type ShelfFrameOption,
} from "../lib/appearance-catalog";
import { DECORATION_CATEGORIES, type DecorationCategory } from "../lib/decoration-catalog";
import { updateShelf } from "../api/shelves-client";
import { useShelfEditorStore } from "../store/shelf-editor-store";
import { DecorationPalette } from "./decoration-palette";

function ShelfFramePaletteItem({ option }: { option: ShelfFrameOption }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-shelf-${option.key}`,
    data: { kind: "palette", type: "shelf", variant: option.key },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      className="shelf-appearance-thumb"
      aria-label={`Arrastrar al canvas: ${option.label}`}
      style={{
        opacity: isDragging ? 0.4 : 1,
        backgroundImage: `url(${option.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}

type Tab = "fondo" | "estanteria" | "decoracion";

const TABS: { key: Tab; label: string }[] = [
  { key: "fondo", label: "Fondo" },
  { key: "estanteria", label: "Estantería" },
  { key: "decoracion", label: "Decoración" },
];

export function ShelfCustomizationPanel({ shelf }: { shelf: ShelfWithBooks }) {
  const [tab, setTab] = useState<Tab>("fondo");
  const [decorationCategory, setDecorationCategory] =
    useState<DecorationCategory>("Todo");
  const patchShelfMeta = useShelfEditorStore((state) => state.patchShelfMeta);

  function save(patch: UpdateShelfInput) {
    // Apply optimistically and leave it — these fields (background/frame
    // pickers) aren't transformed server-side, so the value we send back is
    // exactly what gets stored. Re-patching from the response caused a race:
    // an earlier click's response could resolve after a later click's and
    // silently revert the selection back to the earlier one.
    patchShelfMeta(patch);
    updateShelf(shelf.id, patch).catch(() => {});
  }

  return (
    <aside className="shelf-customization-panel">
      <div className="shelf-customization-tabs" role="tablist">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`shelf-customization-tab ${tab === key ? "shelf-customization-tab-active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "fondo" && (
        <div className="shelf-customization-body">
          <p className="shelf-customization-hint">Elige tu fondo</p>
          <div className="shelf-appearance-grid">
            {BACKGROUND_OPTIONS.map((option) => {
              const isSelected =
                option.kind === "photo"
                  ? shelf.backgroundImageUrl === option.value
                  : !shelf.backgroundImageUrl && shelf.backgroundColor === option.value;

              return (
                <button
                  key={option.key}
                  type="button"
                  className="shelf-appearance-thumb"
                  aria-pressed={isSelected}
                  aria-label={option.label}
                  onClick={() =>
                    save(
                      option.kind === "photo"
                        ? { backgroundImageUrl: option.value }
                        : { backgroundImageUrl: "", backgroundColor: option.value },
                    )
                  }
                  style={
                    option.kind === "photo"
                      ? {
                          backgroundImage: `url(${option.value})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : { backgroundColor: option.value }
                  }
                >
                  {isSelected && (
                    <span className="shelf-appearance-thumb-check">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === "estanteria" && (
        <div className="shelf-customization-body">
          <p className="shelf-customization-hint">
            Arrastrá una estantería al canvas
          </p>
          <div className="shelf-appearance-grid">
            {SHELF_FRAME_OPTIONS.map((option) => (
              <ShelfFramePaletteItem key={option.key} option={option} />
            ))}
          </div>
        </div>
      )}

      {tab === "decoracion" && (
        <div className="shelf-customization-body">
          <p className="shelf-customization-hint">Decoraciones disponibles</p>
          <div className="decoration-category-chips">
            {DECORATION_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={`decoration-category-chip ${
                  decorationCategory === category ? "decoration-category-chip-active" : ""
                }`}
                onClick={() => setDecorationCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <DecorationPalette category={decorationCategory} />
        </div>
      )}
    </aside>
  );
}
