import { redirect } from "next/navigation";
import { getServerUser } from "@/shared/lib/auth-server";

export default async function Home() {
  const user = await getServerUser();
  redirect(user ? "/library" : "/login");
}
