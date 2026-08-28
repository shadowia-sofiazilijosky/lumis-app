"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { BRUSHES } from "../lib/brushes";
import { useAnnotationsStore } from "../store/annotations-store";
import { ColorPicker, hsvToHex } from "./color-picker";

/** The "pick the brush before you draw" panel: color (full HSV spectrum +
 * alpha), brush texture, and thickness chosen here become the active tool —
 * then any stroke drawn on the page paints with it directly, like a brush
 * tool in an image editor. */
export function DrawingToolPanel() {
  const t = useTranslations("reader");
  const drawTool = useAnnotationsStore((state) => state.drawTool);
  const setDrawTool = useAnnotationsStore((state) => state.setDrawTool);
  const setDrawToolPickerOpen = useAnnotationsStore(
    (state) => state.setDrawToolPickerOpen,
  );

  const [hue, setHue] = useState(45);
  const [saturation, setSaturation] = useState(70);
  const [value, setValue] = useState(95);
  const [alpha, setAlpha] = useState(60);
  const [brushKey, setBrushKey] = useState(drawTool?.brush ?? "marker");
  const [size, setSize] = useState(drawTool?.size ?? 14);

  const isEraser = brushKey === "eraser";
  const currentHex = hsvToHex(hue, saturation, value, alpha);

  function applyTool() {
    setDrawTool({ color: isEraser ? "#000000FF" : currentHex, brush: brushKey, size });
  }

  return (
    <div className="pen-panel" onPointerDown={(event) => event.stopPropagation()}>
      {!isEraser && (
        <ColorPicker
          hue={hue}
          saturation={saturation}
          value={value}
          alpha={alpha}
          onChange={(patch) => {
            if (patch.hue !== undefined) setHue(patch.hue);
            if (patch.saturation !== undefined) setSaturation(patch.saturation);
            if (patch.value !== undefined) setValue(patch.value);
            if (patch.alpha !== undefined) setAlpha(patch.alpha);
          }}
        />
      )}

      <label className="pen-panel-opacity">
        {t("drawPanel.thickness", { size: Math.round(size) })}
        <input
          type="range"
          min={2}
          max={48}
          value={size}
          onChange={(event) => setSize(Number(event.target.value))}
        />
      </label>

      <div className="pen-panel-brushes">
        {BRUSHES.map((brush) => (
          <button
            key={brush.key}
            type="button"
            className={brush.key === brushKey ? "pen-panel-brush-active" : ""}
            aria-pressed={brush.key === brushKey}
            onClick={() => setBrushKey(brush.key)}
          >
            {brush.key === brushKey && <Check size={11} />}
            {t(`brushes.${brush.key}`)}
          </button>
        ))}
      </div>

      {!isEraser && (
        <div
          className="pen-panel-preview"
          style={{ background: "repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 0 0 / 12px 12px" }}
        >
          <span
            className="pen-panel-preview-swatch"
            style={{ background: currentHex, height: Math.min(size, 26) }}
          />
        </div>
      )}

      <div className="pen-panel-actions">
        <button type="button" className="secondary" onClick={() => setDrawToolPickerOpen(false)}>
          {t("drawPanel.cancel")}
        </button>
        <button type="button" onClick={applyTool}>
          {isEraser ? t("drawPanel.useEraser") : t("drawPanel.useBrush")}
        </button>
        {drawTool && (
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setDrawTool(null);
              setDrawToolPickerOpen(false);
            }}
          >
            {t("drawPanel.turnOffTool")}
          </button>
        )}
      </div>
    </div>
  );
}
