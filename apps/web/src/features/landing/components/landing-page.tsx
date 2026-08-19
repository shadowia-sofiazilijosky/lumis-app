import { BookOpen, Check, Moon, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/shared/components/site-footer";
import { SiteHeader } from "@/shared/components/site-header";

const FEATURES = [
  {
    icon: "/assets/landing/icon-estanteria.png",
    width: 612,
    height: 408,
    title: "Estanterías personalizables",
    description: "Decora y organiza tus libros como quieras.",
  },
  {
    icon: "/assets/landing/icon-libro.png",
    width: 612,
    height: 408,
    title: "Lector universal",
    description: "Lee tus archivos en cualquier formato con una experiencia inmersiva.",
  },
  {
    icon: "/assets/landing/icon-diario.png",
    width: 408,
    height: 612,
    title: "Registra tu lectura",
    description: "Fechas, notas, reseñas, tags y estados de lectura.",
  },
  {
    icon: "/assets/landing/icon-spicy-romance.png",
    width: 612,
    height: 408,
    title: "Spicy & Romance",
    description: "Califica el nivel de picante y romance de tus historias.",
  },
  {
    icon: "/assets/landing/icon-modo-noche.png",
    width: 612,
    height: 408,
    title: "Modo claro y oscuro",
    description: "Elegí tu ambiente favorito para leer.",
  },
];

const READER_CHECKLIST = [
  "Efecto de página realista",
  "Resaltados y notas",
  "Sincronización en la nube",
];

const CTA_STARS = [
  { top: "12%", left: "48%" },
  { top: "28%", left: "88%" },
  { top: "68%", left: "10%" },
  { top: "78%", left: "62%" },
  { top: "45%", left: "6%" },
];

export function LandingPage() {
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
              Tu biblioteca,
              <br />
              <em>a tu manera</em>
            </h1>
            <p className="landing-hero-v2-subtitle">
              La biblioteca virtual que combina un lector universal con
              estanterías personalizables y el seguimiento de tu experiencia
              de lectura.
            </p>

            <div className="landing-hero-v2-actions">
              <Link href="/register" className="landing-cta-primary">
                Comenzar mi biblioteca <span aria-hidden="true">→</span>
              </Link>
              <Link href="/about" className="landing-cta-secondary">
                Conocer más
              </Link>
            </div>

            <p className="landing-hero-v2-formats">
              <BookOpen size={22} aria-hidden="true" />
              Compatible con PDF, EPUB, MOBI, AZW3, CBR/CBZ, TXT y más.
            </p>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-features-grid">
          {FEATURES.map((feature) => (
            <div className="landing-feature" key={feature.title}>
              <Image
                src={feature.icon}
                alt=""
                width={feature.width}
                height={feature.height}
                className="landing-feature-icon"
              />
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
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
            <p className="landing-spark" aria-hidden="true">
              <Sparkles size={22} />
            </p>
            <h2 className="landing-ritmo-title">
              Lee a tu ritmo.
              <br />
              <em>Donde quieras.</em>
            </h2>
            <p className="landing-ritmo-subtitle">
              Guardá tu progreso automáticamente, resaltá tus partes
              favoritas, tomá notas y volvé justo donde lo dejaste, en
              cualquier dispositivo.
            </p>
            <ul className="landing-ritmo-checklist">
              {READER_CHECKLIST.map((item) => (
                <li key={item}>
                  <span className="landing-ritmo-check" aria-hidden="true">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="landing-final-cta">
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
              Crea tu espacio, cuenta tu historia.
              <br />
              <em>Empieza tu biblioteca hoy.</em>
            </h2>
            <Link href="/register" className="landing-cta-primary">
              Comenzar mi biblioteca <span aria-hidden="true">→</span>
            </Link>
            <p className="landing-final-cta-fineprint">
              Sin tarjeta de crédito. Gratis para empezar.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
