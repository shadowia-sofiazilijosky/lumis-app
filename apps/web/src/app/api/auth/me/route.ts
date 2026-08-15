import { NextResponse } from "next/server";
import { resolveCurrentUser } from "@/shared/lib/auth-server";

export async function GET() {
  const user = await resolveCurrentUser();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
