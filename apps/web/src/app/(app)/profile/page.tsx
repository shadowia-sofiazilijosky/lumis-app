import { redirect } from "next/navigation";
import { ProfilePage } from "@/features/profile/components/profile-page";
import { getServerUser } from "@/shared/lib/auth-server";

export const metadata = {
  title: "Perfil — Lumis",
};

export default async function Profile() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return <ProfilePage initialUser={user} />;
}
