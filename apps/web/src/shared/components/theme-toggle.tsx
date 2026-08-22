"use client";

import { Moon, Sun } from "lucide-react";
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

interface ThemeToggleProps {
  initialTheme: ThemeMode | null;
}

/**
 * Global light/dark switch — sun and moon both stay visible on the track,
 * with a pill that slides between them. Mounted once in the sidebar, so
 * it's reachable from every screen after login; the public marketing site
 * keeps a fixed cozy palette with no toggle at all.
 */
export function ThemeToggle({ initialTheme }: ThemeToggleProps) {
  // No cookie yet (first-ever visit): fall back to — and stay live-synced
  // with — the OS preference via useSyncExternalStore, rather than guessing
  // once in an effect. The page itself already follows prefers-color-scheme
  // via CSS regardless; this only decides which side the pill sits on.
  const osTheme = useSyncExternalStore(subscribeToOsScheme, getOsScheme, getServerOsScheme);
  const [override, setOverride] = useState<ThemeMode | null>(initialTheme);
  const theme = override ?? osTheme;
  const isDark = theme === "dark";

  function toggle() {
    const next: ThemeMode = isDark ? "light" : "dark";
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
      role="switch"
      aria-checked={isDark}
      className="theme-switch"
      onClick={toggle}
      aria-label="Cambiar entre modo claro y oscuro"
    >
      <Sun size={18} className="theme-switch-icon theme-switch-icon-sun" aria-hidden="true" />
      <Moon size={18} className="theme-switch-icon theme-switch-icon-moon" aria-hidden="true" />
      <span className={`theme-switch-thumb ${isDark ? "theme-switch-thumb-dark" : ""}`}>
        {isDark ? <Moon size={17} /> : <Sun size={17} />}
      </span>
    </button>
  );
}
