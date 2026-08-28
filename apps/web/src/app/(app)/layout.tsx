import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { Sidebar } from "@/shared/components/sidebar";
import { getServerUser } from "@/shared/lib/auth-server";
import { getThemeCookie } from "@/shared/lib/theme-cookie";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, theme, t] = await Promise.all([
    getServerUser(),
    getThemeCookie(),
    getTranslations("nav"),
  ]);
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="app-shell">
      <Sidebar initialTheme={theme} />
      <div className="app-main-area">
        <header className="app-topbar">
          <span className="header-greeting">
            {user.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived Supabase URL
              <img src={user.avatarUrl} alt="" className="header-greeting-avatar" />
            )}
            {t("greeting", { name: user.displayName })}
          </span>
          <LogoutButton />
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
