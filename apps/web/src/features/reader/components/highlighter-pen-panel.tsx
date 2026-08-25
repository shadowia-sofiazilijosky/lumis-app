"use client";

import { useState } from "react";
import type { HighlightSize } from "../store/annotations-store";
import { useAnnotationsStore } from "../store/annotations-store";
import { hueToHex, PastelHueWheel } from "./pastel-hue-wheel";

const SIZE_OPTIONS: { size: HighlightSize; label: string; barHeight: number }[] = [
  { size: "thin", label: "Fino", barHeight: 4 },
  { size: "normal", label: "Normal", barHeight: 8 },
  { size: "thick", label: "Grueso", barHeight: 13 },
];

function withAlpha(hex: string, alphaPercent: number): string {
  const alphaByte = Math.round((alphaPercent / 100) * 255);
  return `${hex}${alphaByte.toString(16).padStart(2, "0")}`;
}

/** The "pick the pen before you paint" panel: hue + size chosen here become
 * the active tool, then any text drag on the page applies them immediately. */
export function HighlighterPenPanel() {
  const activePen = useAnnotationsStore((state) => state.activePen);
  const setActivePen = useAnnotationsStore((state) => state.setActivePen);
  const setPenPickerOpen = useAnnotationsStore((state) => state.setPenPickerOpen);

  const [hue, setHue] = useState(45);
  const [opacity, setOpacity] = useState(55);
  const [size, setSize] = useState<HighlightSize>(activePen?.size ?? "normal");

  const baseColor = hueToHex(hue);
  const previewColor = withAlpha(baseColor, opacity);

  function applyPen() {
    setActivePen({ color: previewColor, size });
  }

  return (
    <div className="pen-panel" onPointerDown={(event) => event.stopPropagation()}>
      <PastelHueWheel hue={hue} onChange={setHue} />

      <label className="pen-panel-opacity">
        Transparencia
        <input
          type="range"
          min={20}
          max={90}
          value={opacity}
          onChange={(event) => setOpacity(Number(event.target.value))}
        />
      </label>

      <div className="pen-panel-sizes">
        {SIZE_OPTIONS.map((option) => (
          <button
            key={option.size}
            type="button"
            className={option.size === size ? "pen-panel-size-active" : ""}
            aria-pressed={option.size === size}
            onClick={() => setSize(option.size)}
          >
            <span
              className="pen-panel-size-bar"
              style={{ height: option.barHeight, background: previewColor }}
            />
            {option.label}
          </button>
        ))}
      </div>

      <div className="pen-panel-preview" style={{ background: previewColor }}>
        Así se va a ver
      </div>

      <div className="pen-panel-actions">
        <button type="button" className="secondary" onClick={() => setPenPickerOpen(false)}>
          Cancelar
        </button>
        <button type="button" onClick={applyPen}>
          Usar este resaltador
        </button>
        {activePen && (
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setActivePen(null);
              setPenPickerOpen(false);
            }}
          >
            Apagar resaltador
          </button>
        )}
      </div>
    </div>
  );
}
