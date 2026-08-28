import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/register-form";

export async function generateMetadata() {
  const t = await getTranslations("auth.register");
  return { title: t("pageTitle") };
}

export default async function RegisterPage() {
  const t = await getTranslations("auth.register");
  return (
    <main className="auth-page">
      <h1>{t("heading")}</h1>
      <RegisterForm />
      <p>
        {t("hasAccount")} <Link href="/login">{t("login")}</Link>
      </p>
    </main>
  );
}
