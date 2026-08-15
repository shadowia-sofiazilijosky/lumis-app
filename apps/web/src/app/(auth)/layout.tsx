import { redirect } from "next/navigation";
import { getServerUser } from "@/shared/lib/auth-server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();
  if (user) {
    redirect("/library");
  }

  return children;
}
