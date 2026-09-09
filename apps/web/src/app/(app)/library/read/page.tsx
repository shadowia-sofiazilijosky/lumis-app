import { getTranslations } from "next-intl/server";
import { FinishedBooksView } from "@/features/books/components/finished-books-view";

export async function generateMetadata() {
  const t = await getTranslations("finishedBooks");
  return { title: t("pageTitle") };
}

export default async function FinishedBooksPage() {
  const t = await getTranslations("finishedBooks");
  return (
    <section>
      <h1>{t("heading")}</h1>
      <FinishedBooksView />
    </section>
  );
}
