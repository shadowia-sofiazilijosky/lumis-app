import { redirect } from "next/navigation";
import { LandingPage } from "@/features/landing/components/landing-page";
import { getServerUser } from "@/shared/lib/auth-server";
import { getThemeCookie } from "@/shared/lib/theme-cookie";

export default async function Home() {
  const [user, theme] = await Promise.all([getServerUser(), getThemeCookie()]);
  if (user) redirect("/library");
  return <LandingPage initialTheme={theme} />;
}
