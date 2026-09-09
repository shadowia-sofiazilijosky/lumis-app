import { NextResponse } from "next/server";
import type { AuthTokenPair, LoginInput } from "@lumis/shared-types";
import { ApiError, apiFetch } from "@/shared/lib/api-server";
import { setAuthCookies } from "@/shared/lib/auth-cookies";

export async function POST(request: Request) {
  const body = (await request.json()) as LoginInput;

  try {
    const { accessToken, refreshToken, user } = await apiFetch<AuthTokenPair>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(body) },
    );

    await setAuthCookies(accessToken, refreshToken, body.rememberMe === true);
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.body, { status: error.status });
    }
    throw error;
  }
}
