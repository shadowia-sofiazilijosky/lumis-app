import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";
import { PageTitle } from "@/shared/components/page-title";

export async function generateMetadata() {
  const t = await getTranslations("auth.login");
  return { title: t("pageTitle") };
}

export default async function LoginPage() {
  const t = await getTranslations("auth.login");
  return (
    <main className="auth-page">
      <PageTitle>{t("heading")}</PageTitle>
      <LoginForm />
      <p>
        {t("noAccount")} <Link href="/register">{t("createOne")}</Link>
      </p>
    </main>
  );
}
