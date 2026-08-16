import Link from "next/link";
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
        <nav>
          <Link href="/library">Biblioteca</Link>
          <Link href="/shelves">Estanterías</Link>
        </nav>
        <span>Hola, {user.displayName}</span>
        <LogoutButton />
      </header>
      <main>{children}</main>
    </div>
  );
}
