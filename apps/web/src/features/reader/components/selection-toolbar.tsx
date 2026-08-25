"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { createHighlight } from "../api/annotations-client";
import { useAnnotationsStore } from "../store/annotations-store";

// Quick-pick shortcuts — the full spectrum + opacity slider below covers
// everything else, these are just a fast path for the common cases.
const PRESET_COLORS = ["#F5D76E", "#E8A0BF", "#A3D9A5", "#9EC5E8", "#C9A0E8", "#F2A65A"];

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value = parseInt(normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function withAlpha(hex: string, alphaPercent: number): string {
  const alphaByte = Math.round((alphaPercent / 100) * 255);
  return `${hex}${alphaByte.toString(16).padStart(2, "0")}`;
}

/** Floating toolbar shown over an in-progress text selection: a full-spectrum
 * color + opacity picker, quick-pick presets, and "Nota". */
export function SelectionToolbar({ bookId }: { bookId: string }) {
  const pendingSelection = useAnnotationsStore((state) => state.pendingSelection);
  const openNoteId = useAnnotationsStore((state) => state.openNoteId);
  const addHighlight = useAnnotationsStore((state) => state.addHighlight);
  const setPendingSelection = useAnnotationsStore(
    (state) => state.setPendingSelection,
  );
  const startNewNote = useAnnotationsStore((state) => state.startNewNote);

  const [baseColor, setBaseColor] = useState("#F5D76E");
  const [opacity, setOpacity] = useState(65);
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!pendingSelection || openNoteId !== null) return null;

  const { rect } = pendingSelection;
  const top = rect.top > 60 ? rect.top - 52 : rect.bottom + 10;

  async function applyHighlight(color: string) {
    if (!pendingSelection) return;
    const highlight = await createHighlight(bookId, {
      color,
      pageIndex: pendingSelection.pageIndex,
      startOffset: pendingSelection.startOffset,
      endOffset: pendingSelection.endOffset,
      selectedText: pendingSelection.text,
      ...(pendingSelection.cfi && { cfi: pendingSelection.cfi }),
    });
    if (highlight) addHighlight(highlight);
    setPendingSelection(null);
    setPickerOpen(false);
    window.getSelection()?.removeAllRanges();
  }

  const previewColor = withAlpha(baseColor, opacity);
  const [r, g, b] = hexToRgb(baseColor);

  return (
    <div
      className="selection-toolbar"
      style={{ top, left: rect.left + rect.width / 2 }}
    >
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className="selection-toolbar-swatch"
          style={{ background: withAlpha(color, opacity) }}
          aria-label={`Resaltar con ${color}`}
          onClick={() => applyHighlight(withAlpha(color, opacity))}
        />
      ))}

      <button
        type="button"
        className="selection-toolbar-swatch selection-toolbar-swatch-custom"
        style={{ background: previewColor }}
        aria-label="Elegir color personalizado"
        aria-expanded={pickerOpen}
        onClick={() => setPickerOpen((open) => !open)}
      />

      <button type="button" className="selection-toolbar-note" onClick={startNewNote}>
        Nota
      </button>
      <button
        type="button"
        className="selection-toolbar-close"
        aria-label="Cerrar"
        onClick={() => setPendingSelection(null)}
      >
        <X size={14} />
      </button>

      {pickerOpen && (
        <div
          className="selection-toolbar-picker"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <input
            type="color"
            value={baseColor}
            onChange={(event) => setBaseColor(event.target.value)}
            className="selection-toolbar-picker-input"
            aria-label="Color del resaltado (espectro completo)"
          />
          <label className="selection-toolbar-picker-opacity">
            Transparencia
            <input
              type="range"
              min={10}
              max={100}
              value={opacity}
              onChange={(event) => setOpacity(Number(event.target.value))}
            />
          </label>
          <span className="selection-toolbar-picker-preview" style={{ background: previewColor }}>
            {`rgba(${r}, ${g}, ${b}, ${(opacity / 100).toFixed(2)})`}
          </span>
          <button
            type="button"
            className="selection-toolbar-picker-apply"
            onClick={() => applyHighlight(previewColor)}
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
