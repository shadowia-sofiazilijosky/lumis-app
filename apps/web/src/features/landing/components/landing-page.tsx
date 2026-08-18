import Link from "next/link";

/**
 * No photographic background asset — approximated with layered warm
 * gradients + the same wood-shelf/book-spine visual language already used
 * in the Shelves editor, so the "reading nook" feel stays consistent
 * across the app instead of introducing a one-off illustration style.
 */
export function LandingPage() {
  return (
    <div className="landing-hero">
      <div className="landing-glow landing-glow-1" aria-hidden="true" />
      <div className="landing-glow landing-glow-2" aria-hidden="true" />

      <div className="landing-content">
        <p className="landing-spark" aria-hidden="true">
          ✦
        </p>
        <h1 className="landing-title">Lumis</h1>
        <p className="landing-tagline">
          Tu rincón de lectura,
          <br />
          <span>a tu manera.</span>
        </p>
        <p className="landing-subtitle">
          Tu biblioteca personal. Tus libros, tus reglas, tu espacio.
        </p>

        <div className="landing-actions">
          <Link href="/register" className="landing-cta-primary">
            Crear cuenta <span aria-hidden="true">✦</span>
          </Link>
          <Link href="/login" className="landing-cta-secondary">
            Iniciar sesión
          </Link>
        </div>
      </div>

      <div className="landing-shelf" aria-hidden="true">
        <div className="landing-shelf-books">
          <span className="landing-shelf-spine" style={{ background: "#8c2f39", height: "78%" }} />
          <span className="landing-shelf-spine" style={{ background: "#b8925a", height: "92%" }} />
          <span className="landing-shelf-spine" style={{ background: "#5b4636", height: "70%" }} />
          <span className="landing-shelf-spine" style={{ background: "#6e8f6b", height: "85%" }} />
          <span className="landing-shelf-spine" style={{ background: "#c98a94", height: "65%" }} />
          <span className="landing-shelf-spine" style={{ background: "#8c2f39", height: "88%" }} />
          <span className="landing-shelf-spine" style={{ background: "#3b6a7a", height: "75%" }} />
        </div>
        <div className="landing-shelf-plank" />
      </div>
    </div>
  );
}
