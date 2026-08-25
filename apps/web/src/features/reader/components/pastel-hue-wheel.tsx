"use client";

import { useRef } from "react";

// Fixed pastel band — every hue around the wheel stays soft/muted at this
// saturation+lightness, only the hue itself changes as the user drags.
const PASTEL_SATURATION = 55;
const PASTEL_LIGHTNESS = 82;

function hueToHex(hue: number): string {
  const s = PASTEL_SATURATION / 100;
  const l = PASTEL_LIGHTNESS / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) [r, g, b] = [c, x, 0];
  else if (hue < 120) [r, g, b] = [x, c, 0];
  else if (hue < 180) [r, g, b] = [0, c, x];
  else if (hue < 240) [r, g, b] = [0, x, c];
  else if (hue < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toByte = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

interface PastelHueWheelProps {
  hue: number;
  onChange: (hue: number) => void;
}

/** A continuous, full-spectrum hue wheel constrained to soft pastel tones —
 * every angle around the ring is a different hue at the same pastel
 * saturation/lightness, so any color the user picks stays gentle. */
export function PastelHueWheel({ hue, onChange }: PastelHueWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function hueFromPointer(clientX: number, clientY: number) {
    const wheel = wheelRef.current;
    if (!wheel) return;
    const rect = wheel.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
    onChange((angle + 360) % 360);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    (event.target as Element).setPointerCapture(event.pointerId);
    hueFromPointer(event.clientX, event.clientY);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    hueFromPointer(event.clientX, event.clientY);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    (event.target as Element).releasePointerCapture(event.pointerId);
  }

  const angleRad = (hue * Math.PI) / 180;
  const knobRadius = 42;

  return (
    <div
      ref={wheelRef}
      className="hue-wheel"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="slider"
      aria-label="Elegir color (espectro pastel)"
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={Math.round(hue)}
    >
      <div
        className="hue-wheel-knob"
        style={{
          left: `calc(50% + ${Math.cos(angleRad) * knobRadius}px)`,
          top: `calc(50% + ${Math.sin(angleRad) * knobRadius}px)`,
          background: hueToHex(hue),
        }}
      />
    </div>
  );
}

export { hueToHex };
