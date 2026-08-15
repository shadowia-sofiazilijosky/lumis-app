import { NextResponse } from "next/server";
import { resolveCurrentUser } from "@/shared/lib/auth-server";

export async function POST() {
  const user = await resolveCurrentUser();

  if (!user) {
    return NextResponse.json(
      { message: "No hay sesión activa." },
      { status: 401 },
    );
  }

  return NextResponse.json({ user });
}
