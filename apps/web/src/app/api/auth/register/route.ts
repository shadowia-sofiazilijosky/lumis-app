import { NextResponse } from "next/server";
import type { AuthTokenPair, RegisterInput } from "@lumis/shared-types";
import { ApiError, apiFetch } from "@/shared/lib/api-server";
import { setAuthCookies } from "@/shared/lib/auth-cookies";

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterInput;

  try {
    const { accessToken, refreshToken, user } = await apiFetch<AuthTokenPair>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(body) },
    );

    // Registering doesn't offer a "remember me" choice -- session cookie by
    // default, same as an un-checked login, so a freshly created account
    // isn't silently more persistent than an explicit login would be.
    await setAuthCookies(accessToken, refreshToken, false);
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}
