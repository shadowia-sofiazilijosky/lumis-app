import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/register-form";
import { PageTitle } from "@/shared/components/page-title";

export async function generateMetadata() {
  const t = await getTranslations("auth.register");
  return { title: t("pageTitle") };
}

export default async function RegisterPage() {
  const t = await getTranslations("auth.register");
  return (
    <main className="auth-page">
      <PageTitle>{t("heading")}</PageTitle>
      <RegisterForm />
      <p>
        {t("hasAccount")} <Link href="/login">{t("login")}</Link>
      </p>
    </main>
  );
}
