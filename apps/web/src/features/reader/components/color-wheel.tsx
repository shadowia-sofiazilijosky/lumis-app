"use client";

import { useRef } from "react";

const WHEEL_SIZE = 140;
const WHEEL_RADIUS = WHEEL_SIZE / 2;
const LIGHTNESS = 50;

export function hslToHex(hue: number, saturation: number, lightness = LIGHTNESS): string {
  const s = saturation / 100;
  const l = lightness / 100;
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

interface ColorWheelProps {
  hue: number;
  saturation: number;
  onChange: (hue: number, saturation: number) => void;
}

/** A real HSL color wheel: angle = hue (the full spectrum, all the way
 * around), distance from center = saturation (gray at the center, fully
 * vivid at the rim) — so every color is reachable, pastel or saturated,
 * and the knob always sits exactly where the pointer is. */
export function ColorWheel({ hue, saturation, onChange }: ColorWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function updateFromPointer(clientX: number, clientY: number) {
    const wheel = wheelRef.current;
    if (!wheel) return;
    const rect = wheel.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const radius = Math.min(Math.hypot(dx, dy), WHEEL_RADIUS);
    onChange((angle + 360) % 360, (radius / WHEEL_RADIUS) * 100);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    (event.target as Element).setPointerCapture(event.pointerId);
    updateFromPointer(event.clientX, event.clientY);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    updateFromPointer(event.clientX, event.clientY);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    (event.target as Element).releasePointerCapture(event.pointerId);
  }

  const angleRad = (hue * Math.PI) / 180;
  const knobRadius = (saturation / 100) * WHEEL_RADIUS;

  return (
    <div
      ref={wheelRef}
      className="hue-wheel"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="slider"
      aria-label="Elegir color (espectro completo)"
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={Math.round(hue)}
    >
      <div
        className="hue-wheel-knob"
        style={{
          left: `calc(50% + ${Math.cos(angleRad) * knobRadius}px)`,
          top: `calc(50% + ${Math.sin(angleRad) * knobRadius}px)`,
          background: hslToHex(hue, saturation),
        }}
      />
    </div>
  );
}
