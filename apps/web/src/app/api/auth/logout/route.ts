import { NextResponse } from "next/server";
import { apiFetch } from "@/shared/lib/api-server";
import { clearAuthCookies, getRefreshToken } from "@/shared/lib/auth-cookies";

export async function POST() {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // best-effort — clear local cookies regardless of the API's response
    }
  }

  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
