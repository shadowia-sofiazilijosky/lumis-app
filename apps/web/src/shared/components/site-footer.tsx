import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

const CONTACT_EMAIL = "sofiazilijosky@gmail.com";

/** Public-site footer — home, /about, /terms, /privacy. */
export async function SiteFooter() {
  const t = await getTranslations("site.footer");
  const tNav = await getTranslations("site.nav");
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="site-footer-col">
          <Image
            src="/assets/landing/logo-lumis-full.png"
            alt="Lumis"
            width={669}
            height={373}
            className="site-footer-logo-image"
          />
          <p className="site-footer-tagline">{t("tagline")}</p>
          <p className="site-footer-copyright">{t("copyright")}</p>
        </div>

        <div className="site-footer-col">
          <h3>{t("product")}</h3>
          <Link href="/about">{tNav("about")}</Link>
          <Link href="/register">{tNav("register")}</Link>
          <Link href="/login">{tNav("login")}</Link>
        </div>

        <div className="site-footer-col">
          <h3>{t("legal")}</h3>
          <Link href="/terms">{t("terms")}</Link>
          <Link href="/privacy">{t("privacy")}</Link>
        </div>

        <div className="site-footer-col">
          <h3>{t("contact")}</h3>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
      </div>
    </footer>
  );
}
