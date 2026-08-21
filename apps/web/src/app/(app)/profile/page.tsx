import { redirect } from "next/navigation";
import { FontSelector } from "@/shared/components/font-selector";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { getServerUser } from "@/shared/lib/auth-server";
import type { FontMode } from "@/shared/lib/font-cookie-names";
import { getThemeCookie } from "@/shared/lib/theme-cookie";

export const metadata = {
  title: "Perfil — Lumis",
};

export default async function ProfilePage() {
  const [user, theme] = await Promise.all([getServerUser(), getThemeCookie()]);
  if (!user) redirect("/login");

  return (
    <section className="profile-page">
      <h1>Perfil</h1>
      <p>Hola, {user.displayName}.</p>

      <div className="profile-preference-row">
        <span>Modo claro / oscuro</span>
        <ThemeToggle initialTheme={theme} />
      </div>

      <FontSelector initialFont={user.fontPreference as FontMode} />
    </section>
  );
}
