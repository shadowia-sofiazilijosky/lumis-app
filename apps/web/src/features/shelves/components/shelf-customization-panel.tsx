"use client";

import type {
  ShelfDecoration,
  ShelfWithBooks,
  UpdateShelfInput,
} from "@lumis/shared-types";
import { useDraggable } from "@dnd-kit/core";
import { Check } from "lucide-react";
import { useState } from "react";
import {
  BACKGROUND_OPTIONS,
  SHELF_FRAME_OPTIONS,
  type ShelfFrameOption,
} from "../lib/appearance-catalog";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEFAULT_SHELF_FRAME_SIZE,
} from "../lib/canvas";
import { DECORATION_CATEGORIES, type DecorationCategory } from "../lib/decoration-catalog";
import { updateShelf } from "../api/shelves-client";
import { useShelfEditorStore } from "../store/shelf-editor-store";
import { DecorationPalette } from "./decoration-palette";

function ShelfFramePaletteItem({
  option,
  onQuickApply,
}: {
  option: ShelfFrameOption;
  onQuickApply: (option: ShelfFrameOption) => void;
}) {
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
      onClick={() => onQuickApply(option)}
      className="shelf-appearance-thumb"
      aria-label={`Usar en el canvas: ${option.label}`}
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
  const decorations = useShelfEditorStore((state) => state.decorations);
  const selectedDecorationId = useShelfEditorStore(
    (state) => state.selectedDecorationId,
  );
  const addDecoration = useShelfEditorStore((state) => state.addDecoration);
  const setDecorationVariant = useShelfEditorStore(
    (state) => state.setDecorationVariant,
  );

  function save(patch: UpdateShelfInput) {
    // Apply optimistically and leave it — these fields (background/frame
    // pickers) aren't transformed server-side, so the value we send back is
    // exactly what gets stored. Re-patching from the response caused a race:
    // an earlier click's response could resolve after a later click's and
    // silently revert the selection back to the earlier one.
    patchShelfMeta(patch);
    updateShelf(shelf.id, patch).catch(() => {});
  }

  function quickApplyFrame(option: ShelfFrameOption) {
    const selected = decorations.find((d) => d.id === selectedDecorationId);
    // If a shelf-frame is already selected on the canvas, clicking a thumbnail
    // just swaps its style in place; otherwise it drops in a fresh one,
    // centered — the same result a drag-and-drop would give, without dragging.
    if (selected?.type === "shelf") {
      setDecorationVariant(selected.id, option.key);
      return;
    }
    const decoration: ShelfDecoration = {
      id: crypto.randomUUID(),
      type: "shelf",
      variant: option.key,
      x: (CANVAS_WIDTH - DEFAULT_SHELF_FRAME_SIZE.width) / 2,
      y: (CANVAS_HEIGHT - DEFAULT_SHELF_FRAME_SIZE.height) / 2,
      ...DEFAULT_SHELF_FRAME_SIZE,
    };
    addDecoration(decoration);
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
            Elegí una estantería (clic para usarla) o arrastrala al canvas
          </p>
          <div className="shelf-appearance-grid">
            {SHELF_FRAME_OPTIONS.map((option) => (
              <ShelfFramePaletteItem
                key={option.key}
                option={option}
                onQuickApply={quickApplyFrame}
              />
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
