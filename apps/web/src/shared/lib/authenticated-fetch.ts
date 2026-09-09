import type { AuthTokenPair } from "@lumis/shared-types";
import { ApiError, apiFetch } from "./api-server";
import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  getRememberMe,
  setAuthCookies,
} from "./auth-cookies";

/** Server-only: current access token, refreshing it first if missing. Used by routes that need a raw token (e.g. to proxy binary responses) instead of `authenticatedApiFetch`'s JSON-only wrapper. */
export async function getValidAccessToken(): Promise<string | undefined> {
  const accessToken = await getAccessToken();
  if (accessToken) return accessToken;
  return refreshAccessToken();
}

async function refreshAccessToken(): Promise<string | undefined> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return undefined;

  try {
    const tokenPair = await apiFetch<AuthTokenPair>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    await setAuthCookies(tokenPair.accessToken, tokenPair.refreshToken, await getRememberMe());
    return tokenPair.accessToken;
  } catch {
    await clearAuthCookies();
    return undefined;
  }
}

/**
 * Server-only: calls the NestJS API with the current access token,
 * transparently refreshing once on a 401. Only callable from a Route
 * Handler or Server Action — a refresh writes cookies.
 */
export async function authenticatedApiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let accessToken = await getAccessToken();

  if (!accessToken) {
    accessToken = await refreshAccessToken();
    if (!accessToken) {
      throw new ApiError(401, { message: "No hay sesión activa." });
    }
  }

  try {
    return await apiFetch<T>(path, {
      ...init,
      headers: { ...init?.headers, Authorization: `Bearer ${accessToken}` },
    });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
      throw error;
    }

    return apiFetch<T>(path, {
      ...init,
      headers: { ...init?.headers, Authorization: `Bearer ${refreshedToken}` },
    });
  }
}
