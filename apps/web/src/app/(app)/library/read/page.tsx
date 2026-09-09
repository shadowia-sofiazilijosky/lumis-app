import { getTranslations } from "next-intl/server";
import { FinishedBooksView } from "@/features/books/components/finished-books-view";
import { PageTitle } from "@/shared/components/page-title";

export async function generateMetadata() {
  const t = await getTranslations("finishedBooks");
  return { title: t("pageTitle") };
}

export default async function FinishedBooksPage() {
  const t = await getTranslations("finishedBooks");
  return (
    <section>
      <PageTitle>{t("heading")}</PageTitle>
      <FinishedBooksView />
    </section>
  );
}
