import { redirect } from "next/navigation";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { getServerUser } from "@/shared/lib/auth-server";
import { getThemeCookie } from "@/shared/lib/theme-cookie";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, theme] = await Promise.all([getServerUser(), getThemeCookie()]);
  if (user) {
    redirect("/library");
  }

  return (
    <>
      <ThemeToggle initialTheme={theme} />
      {children}
    </>
  );
}
