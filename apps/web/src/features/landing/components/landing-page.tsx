import { BookOpen, Check, Moon, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/shared/components/site-footer";
import { SiteHeader } from "@/shared/components/site-header";

const FEATURES = [
  {
    icon: "/assets/landing/icon-estanteria.png",
    title: "Estanterías personalizables",
    description: "Decora y organiza tus libros como quieras.",
  },
  {
    icon: "/assets/landing/icon-libro.png",
    title: "Lector universal",
    description: "Lee tus archivos en cualquier formato con una experiencia inmersiva.",
  },
  {
    icon: "/assets/landing/icon-diario.png",
    title: "Registra tu lectura",
    description: "Fechas, notas, reseñas, tags y estados de lectura.",
  },
  {
    icon: "/assets/landing/icon-spicy-romance.png",
    title: "Spicy & Romance",
    description: "Califica el nivel de picante y romance de tus historias.",
  },
  {
    icon: "/assets/landing/icon-modo-noche.png",
    title: "Modo claro y oscuro",
    description: "Elegí tu ambiente favorito para leer.",
  },
];

const READER_CHECKLIST = [
  "Efecto de página realista",
  "Resaltados y notas",
  "Sincronización en la nube",
];

export function LandingPage() {
  return (
    <>
      <section className="landing-hero-v2">
        <SiteHeader variant="overlay" />

        <div className="landing-hero-v2-inner">
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
              <BookOpen size={16} aria-hidden="true" />
              Compatible con PDF, EPUB, MOBI, AZW3, CBR/CBZ, TXT y más.
            </p>
          </div>

          <div className="landing-hero-v2-image" aria-hidden="true">
            <Image
              src="/assets/landing/landing-bg.jpg"
              alt=""
              fill
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
            <div className="landing-hero-v2-image-fade" />
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
                width={40}
                height={40}
                className="landing-feature-icon"
              />
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-ritmo">
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
            Guardá tu progreso automáticamente, resaltá tus partes favoritas,
            tomá notas y volvé justo donde lo dejaste, en cualquier
            dispositivo.
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
      </section>

      <section className="landing-final-cta">
        <div className="landing-final-cta-card">
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
      </section>

      <SiteFooter />
    </>
  );
}
