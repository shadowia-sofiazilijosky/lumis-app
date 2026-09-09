import { getTranslations } from "next-intl/server";
import { LibraryView } from "@/features/books/components/library-view";
import { PageTitle } from "@/shared/components/page-title";

export async function generateMetadata() {
  const t = await getTranslations("library");
  return { title: t("pageTitle") };
}

export default async function LibraryPage() {
  const t = await getTranslations("library");
  return (
    <section>
      <PageTitle>{t("heading")}</PageTitle>
      <LibraryView />
    </section>
  );
}
