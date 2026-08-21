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
  const [user, theme] = await Promise.all([getServerUser(), getThemeCookie()]);
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="app-shell">
      <Sidebar initialTheme={theme} />
      <div className="app-main-area">
        <header className="app-topbar">
          <span className="header-greeting">Hola, {user.displayName}</span>
          <LogoutButton />
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
