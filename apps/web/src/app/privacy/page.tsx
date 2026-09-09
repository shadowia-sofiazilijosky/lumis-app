import { getTranslations } from "next-intl/server";
import { PageTitle } from "@/shared/components/page-title";
import { SiteFooter } from "@/shared/components/site-footer";
import { SiteHeader } from "@/shared/components/site-header";

const CONTACT_EMAIL = "sofiazilijosky@gmail.com";
const S3_ITEM_KEYS = ["account", "store", "prefs", "improve", "contact"] as const;
const S2_ITEM_KEYS = ["account", "files", "usage", "prefs", "technical"] as const;
const S7_ITEM_KEYS = ["access", "rectification", "cancellation", "opposition"] as const;

export async function generateMetadata() {
  const t = await getTranslations("privacyPage");
  return { title: t("pageTitle") };
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacyPage");
  return (
    <>
      <SiteHeader variant="solid" />
      <main className="prose-page">
        <PageTitle>{t("heading")}</PageTitle>
        <p className="prose-updated">{t("updated")}</p>

        <p>{t("intro")}</p>

        <h2>{t("s1.title")}</h2>
        <p>
          {t("s1.bodyBeforeEmail")} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <h2>{t("s2.title")}</h2>
        <p>{t("s2.intro")}</p>
        <ul>
          {S2_ITEM_KEYS.map((key) => (
            <li key={key}>
              <strong>{t(`s2.items.${key}.label`)}</strong> {t(`s2.items.${key}.desc`)}
            </li>
          ))}
        </ul>

        <h2>{t("s3.title")}</h2>
        <p>{t("s3.intro")}</p>
        <ul>
          {S3_ITEM_KEYS.map((key) => (
            <li key={key}>{t(`s3.items.${key}`)}</li>
          ))}
        </ul>

        <h2>{t("s4.title")}</h2>
        <p>{t("s4.body")}</p>

        <h2>{t("s5.title")}</h2>
        <p>{t("s5.body")}</p>

        <h2>{t("s6.title")}</h2>
        <p>{t("s6.body")}</p>

        <h2>{t("s7.title")}</h2>
        <p>{t("s7.intro")}</p>
        <ul>
          {S7_ITEM_KEYS.map((key) => (
            <li key={key}>
              <strong>{t(`s7.items.${key}.label`)}</strong> {t(`s7.items.${key}.desc`)}
            </li>
          ))}
        </ul>
        <p>
          {t("s7.exerciseBeforeEmail")} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          {t("s7.exerciseAfterEmail")}
        </p>

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
