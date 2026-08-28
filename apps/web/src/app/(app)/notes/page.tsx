import { getTranslations } from "next-intl/server";
import Link from "next/link";

export async function generateMetadata() {
  const t = await getTranslations("notesPage");
  return { title: t("pageTitle") };
}

export default async function NotesPage() {
  const t = await getTranslations("notesPage");
  return (
    <section>
      <h1>{t("heading")}</h1>
      <p>
        {t.rich("body", {
          link: (chunks) => <Link href="/library">{chunks}</Link>,
        })}
      </p>
    </section>
  );
}
