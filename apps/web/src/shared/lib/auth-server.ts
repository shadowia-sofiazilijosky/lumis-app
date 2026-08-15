import type { AuthTokenPair, PublicUser } from "@lumis/shared-types";
import { ApiError, apiFetch } from "./api-server";
import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  setAuthCookies,
} from "./auth-cookies";

function fetchMe(accessToken: string): Promise<PublicUser> {
  return apiFetch<PublicUser>("/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

/**
 * Read-only current-user lookup — safe to call from Server Components (layouts, pages).
 * Does NOT attempt a silent refresh (that requires writing cookies, which Server Components can't do).
 * Returns null on any failure, including an expired access token.
 */
export async function getServerUser(): Promise<PublicUser | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    return await fetchMe(accessToken);
  } catch {
    return null;
  }
}

/**
 * Full current-user resolution with silent refresh — only callable from a
 * Route Handler or Server Action (it writes cookies on refresh/failure).
 */
export async function resolveCurrentUser(): Promise<PublicUser | null> {
  const accessToken = await getAccessToken();

  if (accessToken) {
    try {
      return await fetchMe(accessToken);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }
      // access token expired/invalid — fall through to silent refresh below
    }
  }

  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    await clearAuthCookies();
    return null;
  }

  try {
    const tokenPair = await apiFetch<AuthTokenPair>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    await setAuthCookies(tokenPair.accessToken, tokenPair.refreshToken);
    return tokenPair.user;
  } catch {
    await clearAuthCookies();
    return null;
  }
}
