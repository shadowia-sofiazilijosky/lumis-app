import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { ThemeToggle } from "@/shared/components/theme-toggle";
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
    <div>
      <ThemeToggle initialTheme={theme} />
      <header>
        <nav>
          <Link href="/library">Biblioteca</Link>
          <Link href="/shelves">Estanterías</Link>
        </nav>
        <span className="header-greeting">Hola, {user.displayName}</span>
        <LogoutButton />
      </header>
      <main>{children}</main>
    </div>
  );
}
