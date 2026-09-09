import { getTranslations } from "next-intl/server";
import { PageTitle } from "@/shared/components/page-title";
import { SiteFooter } from "@/shared/components/site-footer";
import { SiteHeader } from "@/shared/components/site-header";

export async function generateMetadata() {
  const t = await getTranslations("aboutPage");
  return { title: t("pageTitle") };
}

export default async function AboutPage() {
  const t = await getTranslations("aboutPage");
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="prose-page">
        <PageTitle>{t("heading")}</PageTitle>

        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
        <p>{t("p4")}</p>
      </main>
      <SiteFooter />
    </>
  );
}
