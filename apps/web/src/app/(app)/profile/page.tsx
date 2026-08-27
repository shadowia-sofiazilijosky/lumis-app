import { redirect } from "next/navigation";
import { getServerUser } from "@/shared/lib/auth-server";

export const metadata = {
  title: "Perfil — Lumis",
};

export default async function ProfilePage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return (
    <section className="profile-page">
      <h1>Perfil</h1>
      <p>Hola, {user.displayName}.</p>
    </section>
  );
}
