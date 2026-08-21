"use client";

import { useState } from "react";
import { FONT_COOKIE, type FontMode } from "../lib/font-cookie-names";

const FONT_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

const FONT_LABELS: Record<FontMode, string> = {
  LORA: "Lora (serif clásica)",
  PLAYFAIR_DISPLAY: "Playfair Display (serif editorial)",
  INTER: "Inter (sans-serif moderna)",
  CAVEAT: "Caveat (manuscrita)",
};

const FONT_OPTIONS: FontMode[] = ["LORA", "PLAYFAIR_DISPLAY", "INTER", "CAVEAT"];

interface FontSelectorProps {
  initialFont: FontMode | null;
}

/** Lets the user pick their heading font — applied app-wide via [data-font] on <html>. */
export function FontSelector({ initialFont }: FontSelectorProps) {
  const [font, setFont] = useState<FontMode>(initialFont ?? "LORA");

  function handleChange(next: FontMode) {
    setFont(next);
    document.documentElement.dataset.font = next;
    document.cookie = `${FONT_COOKIE}=${next}; path=/; max-age=${FONT_MAX_AGE_SECONDS}; samesite=lax`;

    // Best-effort cross-device persistence — silently no-ops when logged out.
    fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fontPreference: next }),
    }).catch(() => {});
  }

  return (
    <div className="font-selector">
      <label htmlFor="font-selector-select">Tipografía</label>
      <select
        id="font-selector-select"
        value={font}
        onChange={(event) => handleChange(event.target.value as FontMode)}
      >
        {FONT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {FONT_LABELS[option]}
          </option>
        ))}
      </select>
      <p className="font-selector-preview" style={{ fontFamily: "var(--font-heading)" }}>
        Así se ven tus títulos con esta tipografía.
      </p>
    </div>
  );
}
