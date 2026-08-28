"use client";

import { BookOpen, Library, Menu, StickyNote, User, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ThemeMode } from "../lib/theme-cookie-names";
import { ThemeToggle } from "./theme-toggle";

const COLLAPSED_STORAGE_KEY = "lumis-sidebar-collapsed";

const NAV_ITEMS = [
  { href: "/shelves", key: "shelves" as const, Icon: Library },
  { href: "/library", key: "library" as const, Icon: BookOpen },
  { href: "/notes", key: "notes" as const, Icon: StickyNote },
  { href: "/profile", key: "profile" as const, Icon: User },
];

/**
 * Left nav for every screen inside (app). Two independent toggles share one
 * button: `collapsed` (persisted) shrinks it to icons-only on desktop;
 * `mobileOpen` (never persisted — a drawer shouldn't reopen itself on the
 * next visit) shows/hides it as an overlay on narrow screens.
 */
export function Sidebar({ initialTheme }: { initialTheme: ThemeMode | null }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  // Lazy initializer (not an effect): reads the persisted preference once,
  // synchronously, on the client. Server-rendered markup always starts
  // expanded — a possible one-frame hydration flash beats the cascading
  // re-render (and react-hooks/set-state-in-effect lint violation) that
  // setting this from a useEffect would cause.
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggle() {
    if (window.matchMedia("(max-width: 768px)").matches) {
      setMobileOpen((open) => !open);
      return;
    }
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <>
      {!mobileOpen && (
        <button
          type="button"
          className="sidebar-mobile-trigger"
          onClick={toggle}
          aria-label={t("openMenu")}
        >
          <Menu size={22} />
        </button>
      )}

      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${collapsed ? "sidebar-collapsed" : ""} ${mobileOpen ? "sidebar-mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <Link href="/shelves" className="sidebar-logo">
            <Image
              src="/assets/landing/logo-lumis-full.png"
              alt="Lumis"
              width={669}
              height={373}
              className="sidebar-logo-image"
            />
          </Link>
          <button
            type="button"
            className="sidebar-collapse-toggle"
            onClick={toggle}
            aria-label={collapsed ? t("expand") : t("collapse")}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ href, key, Icon }) => {
            const isActive =
              pathname === href || pathname?.startsWith(`${href}/`);
            const label = t(key);
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-nav-item ${isActive ? "sidebar-nav-item-active" : ""}`}
                onClick={() => setMobileOpen(false)}
                title={label}
              >
                <Icon size={24} aria-hidden="true" />
                <span className="sidebar-nav-label">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <ThemeToggle initialTheme={initialTheme} />
        </div>
      </aside>
    </>
  );
}
