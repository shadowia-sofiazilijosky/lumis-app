import Image from "next/image";
import Link from "next/link";

const CONTACT_EMAIL = "sofiazilijosky@gmail.com";

/** Public-site footer — home, /about, /terms, /privacy. */
export function SiteFooter() {
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
          <p className="site-footer-tagline">Tu rincón de lectura, a tu manera.</p>
          <p className="site-footer-copyright">
            © 2026 Lumis. Todos los derechos reservados.
          </p>
        </div>

        <div className="site-footer-col">
          <h3>Producto</h3>
          <Link href="/about">Sobre Lumis</Link>
          <Link href="/register">Crear cuenta</Link>
          <Link href="/login">Iniciar sesión</Link>
        </div>

        <div className="site-footer-col">
          <h3>Legal</h3>
          <Link href="/terms">Términos y condiciones</Link>
          <Link href="/privacy">Política de privacidad</Link>
        </div>

        <div className="site-footer-col">
          <h3>Contacto</h3>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
      </div>
    </footer>
  );
}
