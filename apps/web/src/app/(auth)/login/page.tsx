import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export async function generateMetadata() {
  const t = await getTranslations("auth.login");
  return { title: t("pageTitle") };
}

export default async function LoginPage() {
  const t = await getTranslations("auth.login");
  return (
    <main className="auth-page">
      <h1>{t("heading")}</h1>
      <LoginForm />
      <p>
        {t("noAccount")} <Link href="/register">{t("createOne")}</Link>
      </p>
    </main>
  );
}
