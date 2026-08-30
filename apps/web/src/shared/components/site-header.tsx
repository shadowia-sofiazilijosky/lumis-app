"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface SiteHeaderProps {
  /** "solid": normal theme-aware header (about/terms/privacy). "overlay": transparent, cream text over the landing hero's fixed-dark background. */
  variant?: "solid" | "overlay";
}

/**
 * Public-site navbar — home, /about, /terms, /privacy. Distinct from the
 * (app) layout's own header (library/shelves), which stays as-is.
 *
 * No theme toggle here by design — the public marketing site keeps a fixed
 * cozy palette; light/dark switching only starts once you're logged in
 * (login/register onward), via the floating ThemeToggle in those layouts.
 *
 * Below the `site-header-collapse` breakpoint (see globals.css) the "Sobre
 * Lumis" / "Iniciar sesión" / "Crear cuenta" row collapses into a hamburger
 * menu so it doesn't crowd the logo on narrow screens; above it, the nav
 * renders inline exactly as it always has.
 */
export function SiteHeader({ variant = "solid" }: SiteHeaderProps) {
  const t = useTranslations("site.nav");
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <header className={`site-header site-header-${variant}`}>
      <Link href="/" className="site-header-logo" onClick={close}>
        <Image
          src="/assets/landing/logo-lumis-full.png"
          alt="Lumis"
          width={669}
          height={373}
          priority
          className="site-header-logo-image"
        />
      </Link>

      <button
        type="button"
        className="site-header-menu-toggle"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? t("closeMenu") : t("openMenu")}
        aria-expanded={open}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      <nav className={`site-header-nav ${open ? "site-header-nav-open" : ""}`}>
        <Link href="/about" className="site-header-link" onClick={close}>
          {t("about")}
        </Link>
        <Link href="/login" className="site-header-btn-secondary" onClick={close}>
          {t("login")}
        </Link>
        <Link href="/register" className="site-header-btn-primary" onClick={close}>
          {t("register")}
        </Link>
      </nav>
    </header>
  );
}
