// Split out from auth-cookies.ts (which imports next/headers) so proxy.ts can
// read the cookie names without pulling in Server Component/Route Handler-only APIs.
export const ACCESS_TOKEN_COOKIE = "lumis_access_token";
export const REFRESH_TOKEN_COOKIE = "lumis_refresh_token";
