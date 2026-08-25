"use client";

import { useRef } from "react";

export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const sat = s / 100;
  const val = v / 100;
  const c = val * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = val - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function toHexByte(v: number): string {
  return Math.round(v).toString(16).padStart(2, "0");
}

export function hsvToHex(h: number, s: number, v: number, alphaPercent = 100): string {
  const [r, g, b] = hsvToRgb(h, s, v);
  const alpha = Math.round((alphaPercent / 100) * 255);
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}${toHexByte(alpha)}`;
}

interface ColorPickerProps {
  hue: number;
  saturation: number;
  value: number;
  alpha: number;
  onChange: (patch: { hue?: number; saturation?: number; value?: number; alpha?: number }) => void;
}

/** A full HSV color picker: a saturation/brightness square at the chosen
 * hue, a hue slider spanning the whole spectrum, and an alpha slider — the
 * same layout as a typical image editor's color dialog, covering every
 * color (not just a pastel band), with transparency handled separately. */
export function ColorPicker({ hue, saturation, value, alpha, onChange }: ColorPickerProps) {
  const squareRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);
  const dragTarget = useRef<"square" | "hue" | "alpha" | null>(null);

  function updateSquare(clientX: number, clientY: number) {
    const el = squareRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const s = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) * 100;
    const v = 100 - Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)) * 100;
    onChange({ saturation: s, value: v });
  }

  function updateHue(clientY: number) {
    const el = hueRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const h = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)) * 360;
    onChange({ hue: h });
  }

  function updateAlpha(clientY: number) {
    const el = alphaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const a = 100 - Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)) * 100;
    onChange({ alpha: a });
  }

  function handleSquareDown(event: React.PointerEvent<HTMLDivElement>) {
    dragTarget.current = "square";
    (event.target as Element).setPointerCapture(event.pointerId);
    updateSquare(event.clientX, event.clientY);
  }

  function handleHueDown(event: React.PointerEvent<HTMLDivElement>) {
    dragTarget.current = "hue";
    (event.target as Element).setPointerCapture(event.pointerId);
    updateHue(event.clientY);
  }

  function handleAlphaDown(event: React.PointerEvent<HTMLDivElement>) {
    dragTarget.current = "alpha";
    (event.target as Element).setPointerCapture(event.pointerId);
    updateAlpha(event.clientY);
  }

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    if (dragTarget.current === "square") updateSquare(event.clientX, event.clientY);
    else if (dragTarget.current === "hue") updateHue(event.clientY);
    else if (dragTarget.current === "alpha") updateAlpha(event.clientY);
  }

  function handleUp(event: React.PointerEvent<HTMLDivElement>) {
    dragTarget.current = null;
    (event.target as Element).releasePointerCapture(event.pointerId);
  }

  const pureHueHex = `#${hsvToRgb(hue, 100, 100).map(toHexByte).join("")}`;
  const currentOpaqueHex = `#${hsvToRgb(hue, saturation, value).map(toHexByte).join("")}`;
  const currentHex = hsvToHex(hue, saturation, value, alpha);

  return (
    <div className="color-picker" onPointerMove={handleMove} onPointerUp={handleUp}>
      <div
        ref={squareRef}
        className="color-picker-square"
        style={{ background: pureHueHex }}
        onPointerDown={handleSquareDown}
      >
        <div className="color-picker-square-white" />
        <div className="color-picker-square-black" />
        <div
          className="color-picker-square-knob"
          style={{ left: `${saturation}%`, top: `${100 - value}%`, background: currentOpaqueHex }}
        />
      </div>

      <div ref={hueRef} className="color-picker-hue" onPointerDown={handleHueDown}>
        <div className="color-picker-hue-knob" style={{ top: `${(hue / 360) * 100}%` }} />
      </div>

      <div
        ref={alphaRef}
        className="color-picker-alpha"
        style={{
          background: `linear-gradient(to bottom, ${currentOpaqueHex}, transparent), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 10px 10px`,
        }}
        onPointerDown={handleAlphaDown}
      >
        <div className="color-picker-alpha-knob" style={{ top: `${100 - alpha}%` }} />
      </div>

      <span className="color-picker-hex">{currentHex.toUpperCase()}</span>
    </div>
  );
}
