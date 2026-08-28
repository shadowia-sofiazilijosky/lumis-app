import { getTranslations } from "next-intl/server";
import { LibraryView } from "@/features/books/components/library-view";

export async function generateMetadata() {
  const t = await getTranslations("library");
  return { title: t("pageTitle") };
}

export default async function LibraryPage() {
  const t = await getTranslations("library");
  return (
    <section>
      <h1>{t("heading")}</h1>
      <LibraryView />
    </section>
  );
}
