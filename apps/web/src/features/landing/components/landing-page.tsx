import { BookOpen, Check, Moon, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/shared/components/site-footer";
import { SiteHeader } from "@/shared/components/site-header";

const FEATURE_ICONS: { key: string; icon: string; width: number; height: number }[] = [
  { key: "shelves", icon: "/assets/landing/icon-estanteria.png", width: 612, height: 408 },
  { key: "reader", icon: "/assets/landing/icon-libro.png", width: 612, height: 408 },
  { key: "log", icon: "/assets/landing/icon-diario.png", width: 408, height: 612 },
  { key: "spicy", icon: "/assets/landing/icon-spicy-romance.png", width: 612, height: 408 },
  { key: "theme", icon: "/assets/landing/icon-modo-noche.png", width: 612, height: 408 },
];

const CHECKLIST_KEYS = ["pageEffect", "highlights", "sync"] as const;

const CTA_STARS = [
  { top: "12%", left: "48%" },
  { top: "28%", left: "88%" },
  { top: "68%", left: "10%" },
  { top: "78%", left: "62%" },
  { top: "45%", left: "6%" },
];

export async function LandingPage() {
  const t = await getTranslations("landing");
  return (
    <>
      <section className="landing-hero-v2">
        <div className="landing-hero-v2-bg" aria-hidden="true">
          <Image
            src="/assets/landing/landing-bg.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
          <div className="landing-hero-v2-bg-overlay" />
        </div>

        <SiteHeader variant="overlay" />

        <div className="landing-hero-v2-content">
          <div className="landing-hero-v2-text">
            <h1 className="landing-hero-v2-title">
              {t("hero.titleLine1")}
              <br />
              <em>{t("hero.titleEm")}</em>
            </h1>
            <p className="landing-hero-v2-subtitle">{t("hero.subtitle")}</p>

            <div className="landing-hero-v2-actions">
              <Link href="/register" className="landing-cta-primary">
                {t("hero.ctaPrimary")} <span aria-hidden="true">→</span>
              </Link>
              <Link href="/about" className="landing-cta-secondary">
                {t("hero.ctaSecondary")}
              </Link>
            </div>

            <p className="landing-hero-v2-formats">
              <BookOpen size={22} aria-hidden="true" />
              {t("hero.formats")}
            </p>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-features-grid">
          {FEATURE_ICONS.map((feature) => (
            <div className="landing-feature" key={feature.key}>
              <Image
                src={feature.icon}
                alt=""
                width={feature.width}
                height={feature.height}
                className="landing-feature-icon"
              />
              <h3>{t(`features.${feature.key}.title`)}</h3>
              <p>{t(`features.${feature.key}.description`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-ritmo">
        <div className="landing-ritmo-bg" aria-hidden="true">
          <Image
            src="/assets/landing/lee-tu-ritmo-bg.jpg"
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
          <div className="landing-ritmo-bg-overlay" />
        </div>

        <div className="landing-ritmo-content">
          <div className="landing-ritmo-inner">
            <h2 className="landing-ritmo-title">
              {t("ritmo.titleLine1")}
              <br />
              <em>{t("ritmo.titleEm")}</em>
            </h2>
            <p className="landing-ritmo-subtitle">{t("ritmo.subtitle")}</p>
            <ul className="landing-ritmo-checklist">
              {CHECKLIST_KEYS.map((key) => (
                <li key={key}>
                  <span className="landing-ritmo-check" aria-hidden="true">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {t(`ritmo.checklist.${key}`)}
                </li>
              ))}
            </ul>
          </div>

          <Image
            src="/assets/landing/landing-mockup-lector-devices.png"
            alt=""
            width={612}
            height={408}
            sizes="(max-width: 900px) 560px, 640px"
            className="landing-ritmo-mockup"
          />
        </div>

        <div className="landing-final-cta">
          <div className="landing-final-cta-card">
            <Image
              src="/assets/landing/ornamento-floral.png"
              alt=""
              width={677}
              height={369}
              aria-hidden="true"
              className="landing-final-cta-ornament landing-final-cta-ornament-tl"
            />
            <Image
              src="/assets/landing/ornamento-floral.png"
              alt=""
              width={677}
              height={369}
              aria-hidden="true"
              className="landing-final-cta-ornament landing-final-cta-ornament-br"
            />

            {CTA_STARS.map((pos, index) => (
              <Star
                key={index}
                size={12}
                className="landing-final-cta-star"
                style={{ top: pos.top, left: pos.left, animationDelay: `${index * 0.4}s` }}
                aria-hidden="true"
              />
            ))}

            <div className="landing-final-cta-content">
              <Moon size={22} className="landing-final-cta-icon" aria-hidden="true" />
              <h2>
                {t("finalCta.titleLine1")}
                <br />
                <em>{t("finalCta.titleEm")}</em>
              </h2>
              <Link href="/register" className="landing-cta-primary">
                {t("finalCta.cta")} <span aria-hidden="true">→</span>
              </Link>
              <p className="landing-final-cta-fineprint">{t("finalCta.fineprint")}</p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
