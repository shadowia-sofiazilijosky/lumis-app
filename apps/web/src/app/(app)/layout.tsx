import { redirect } from "next/navigation";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { getServerUser } from "@/shared/lib/auth-server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <header>
        <span>Hola, {user.displayName}</span>
        <LogoutButton />
      </header>
      <main>{children}</main>
    </div>
  );
}
