import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import type { ThemeMode } from "../lib/theme-cookie-names";

interface SiteHeaderProps {
  initialTheme: ThemeMode | null;
  /** "solid": normal theme-aware header (about/terms/privacy). "overlay": transparent, cream text over the landing hero's fixed-dark background. */
  variant?: "solid" | "overlay";
}

/** Public-site navbar — home, /about, /terms, /privacy. Distinct from the (app) layout's own header (library/shelves), which stays as-is. */
export function SiteHeader({ initialTheme, variant = "solid" }: SiteHeaderProps) {
  return (
    <header className={`site-header site-header-${variant}`}>
      <Link href="/" className="site-header-logo">
        Lumis
      </Link>
      <nav className="site-header-nav">
        <Link href="/about" className="site-header-link">
          Sobre Lumis
        </Link>
        <Link href="/login" className="site-header-btn-secondary">
          Iniciar sesión
        </Link>
        <Link href="/register" className="site-header-btn-primary">
          Crear cuenta
        </Link>
        <ThemeToggle initialTheme={initialTheme} variant="inline" />
      </nav>
    </header>
  );
}
