import { redirect } from "next/navigation";
import { LandingPage } from "@/features/landing/components/landing-page";
import { getServerUser } from "@/shared/lib/auth-server";

export default async function Home() {
  const user = await getServerUser();
  if (user) redirect("/library");
  return <LandingPage />;
}
