import { getTranslations } from "next-intl/server";
import { PageTitle } from "@/shared/components/page-title";
import { SiteFooter } from "@/shared/components/site-footer";
import { SiteHeader } from "@/shared/components/site-header";

const CONTACT_EMAIL = "sofiazilijosky@gmail.com";

export async function generateMetadata() {
  const t = await getTranslations("termsPage");
  return { title: t("pageTitle") };
}

export default async function TermsPage() {
  const t = await getTranslations("termsPage");
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="prose-page">
        <PageTitle>{t("heading")}</PageTitle>
        <p className="prose-updated">{t("updated")}</p>

        <h2>{t("s1.title")}</h2>
        <p>{t("s1.body")}</p>

        <h2>{t("s2.title")}</h2>
        <p>{t("s2.body")}</p>

        <h2>{t("s3.title")}</h2>
        <p>{t("s3.body")}</p>

        <h2>{t("s4.title")}</h2>
        <p>{t("s4.p1")}</p>
        <p>{t("s4.p2")}</p>
        <p>{t("s4.p3")}</p>
        <p>{t("s4.p4")}</p>
        <p>{t("s4.p5")}</p>

        <h2>{t("s5.title")}</h2>
        <p>{t("s5.body")}</p>

        <h2>{t("s6.title")}</h2>
        <p>{t("s6.body")}</p>

        <h2>{t("s7.title")}</h2>
        <p>{t("s7.body")}</p>

        <h2>{t("s8.title")}</h2>
        <p>{t("s8.body")}</p>

        <h2>{t("s9.title")}</h2>
        <p>{t("s9.body")}</p>

        <h2>{t("s10.title")}</h2>
        <p>{t("s10.body")}</p>

        <h2>{t("s11.title")}</h2>
        <p>
          {t("s11.bodyBeforeEmail")} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
