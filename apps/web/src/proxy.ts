import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/shared/lib/auth-cookie-names";

// Fast, coarse gate: redirect if there's clearly no session cookie at all.
// The (app) layout still does its own server-side check (and the API is the
// real authority), so an expired-but-present cookie just falls through to
// that slower, more precise path instead of getting rejected here.
export function proxy(request: NextRequest) {
  const hasSession =
    request.cookies.has(ACCESS_TOKEN_COOKIE) ||
    request.cookies.has(REFRESH_TOKEN_COOKIE);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/library/:path*",
    "/shelves/:path*",
    "/read/:path*",
    "/settings/:path*",
  ],
};
