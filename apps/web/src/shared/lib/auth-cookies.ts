import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, REMEMBER_ME_COOKIE } from "./auth-cookie-names";

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE };

// Mirrors JWT_ACCESS_EXPIRES_IN / JWT_REFRESH_EXPIRES_IN in apps/api/.env.example.
// If the cookie slightly outlives the token, the API just rejects it — fails closed.
const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/**
 * Writes cookies — only callable from a Route Handler or Server Action.
 *
 * `rememberMe: false` (the default everywhere except an explicit "remember
 * me" login) omits `maxAge` entirely, making these true session cookies —
 * the browser drops them the moment it fully closes, so the next visit
 * needs a real login again. `rememberMe: true` keeps the old always-on
 * behavior (persists across restarts for up to 30 days).
 */
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookieOptions,
    ...(rememberMe ? { maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS } : {}),
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseCookieOptions,
    ...(rememberMe ? { maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS } : {}),
  });
  cookieStore.set(REMEMBER_ME_COOKIE, rememberMe ? "1" : "0", {
    ...baseCookieOptions,
    ...(rememberMe ? { maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS } : {}),
  });
}

/** Deletes cookies — only callable from a Route Handler or Server Action. */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(REMEMBER_ME_COOKIE);
}

/** Read-only — safe to call from Server Components. */
export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

/** Read-only — safe to call from Server Components. */
export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

/** Read-only — whether the current session opted into "remember me". */
export async function getRememberMe(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(REMEMBER_ME_COOKIE)?.value === "1";
}
