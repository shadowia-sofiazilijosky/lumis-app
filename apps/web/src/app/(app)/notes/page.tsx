import { Feather, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("notesPage");
  return { title: t("pageTitle") };
}

export default async function NotesPage() {
  const t = await getTranslations("notesPage");
  return (
    <section className="notes-page">
      <div className="notes-page-header">
        <h1>{t("heading")}</h1>
        <div className="notes-title-divider" aria-hidden="true">
          <span className="notes-divider-line" />
          <Sparkles size={14} className="notes-divider-icon" />
        </div>
      </div>

      <div className="notes-empty-state">
        <Image
          src="/assets/illustrations/empty-notas-illustration.png"
          alt=""
          width={306}
          height={204}
          className="notes-empty-illustration"
        />

        <h2>{t("emptyTitle")}</h2>
        <div className="notes-empty-divider" aria-hidden="true">
          <span className="notes-divider-line" />
          <Sparkles size={11} className="notes-divider-icon" />
        </div>

        <p className="notes-empty-description">
          {t.rich("emptyDescription", {
            em: (chunks) => <em>{chunks}</em>,
          })}
        </p>

        <Link href="/library" className="notes-empty-cta">
          <span className="notes-empty-cta-icon">
            <Feather size={15} />
          </span>
          {t("ctaButton")}
        </Link>
      </div>
    </section>
  );
}
