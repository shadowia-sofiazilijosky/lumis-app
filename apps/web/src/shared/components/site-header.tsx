import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

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
 */
export async function SiteHeader({ variant = "solid" }: SiteHeaderProps) {
  const t = await getTranslations("site.nav");
  return (
    <header className={`site-header site-header-${variant}`}>
      <Link href="/" className="site-header-logo">
        <Image
          src="/assets/landing/logo-lumis-full.png"
          alt="Lumis"
          width={669}
          height={373}
          priority
          className="site-header-logo-image"
        />
      </Link>
      <nav className="site-header-nav">
        <Link href="/about" className="site-header-link">
          {t("about")}
        </Link>
        <Link href="/login" className="site-header-btn-secondary">
          {t("login")}
        </Link>
        <Link href="/register" className="site-header-btn-primary">
          {t("register")}
        </Link>
      </nav>
    </header>
  );
}
