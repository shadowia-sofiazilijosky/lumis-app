"use client";

import { Feather, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

export function NotesEmptyState() {
  const t = useTranslations("notesPage");

  return (
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
  );
}
