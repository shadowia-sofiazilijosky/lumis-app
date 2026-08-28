import { getTranslations } from "next-intl/server";
import { ShelfList } from "@/features/shelves/components/shelf-list";

export async function generateMetadata() {
  const t = await getTranslations("shelvesList");
  return { title: t("pageTitle") };
}

export default function ShelvesPage() {
  return (
    <section>
      <ShelfList />
    </section>
  );
}
