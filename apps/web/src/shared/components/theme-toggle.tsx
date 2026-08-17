"use client";

import { useState, useSyncExternalStore } from "react";
import { THEME_COOKIE, type ThemeMode } from "../lib/theme-cookie-names";

const THEME_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

function subscribeToOsScheme(callback: () => void) {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getOsScheme(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getServerOsScheme(): ThemeMode {
  // Server can't know the OS preference — irrelevant whenever `initialTheme`
  // (from the cookie) is set, since that always takes priority below.
  return "light";
}

/**
 * Global light/dark toggle, rendered once from the root layout so it's
 * available on every screen — including the (auth) login/register pages,
 * which have no header of their own.
 */
export function ThemeToggle({ initialTheme }: { initialTheme: ThemeMode | null }) {
  // No cookie yet (first-ever visit): fall back to — and stay live-synced
  // with — the OS preference via useSyncExternalStore, rather than guessing
  // once in an effect. The page itself already follows prefers-color-scheme
  // via CSS regardless; this only decides which icon the button shows.
  const osTheme = useSyncExternalStore(subscribeToOsScheme, getOsScheme, getServerOsScheme);
  const [override, setOverride] = useState<ThemeMode | null>(initialTheme);
  const theme = override ?? osTheme;

  function toggle() {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setOverride(next);
    document.documentElement.dataset.theme = next;
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${THEME_MAX_AGE_SECONDS}; samesite=lax`;

    // Best-effort cross-device persistence — silently no-ops when logged out.
    fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themePreference: next.toUpperCase() }),
    }).catch(() => {});
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label="Cambiar entre modo claro y oscuro"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
