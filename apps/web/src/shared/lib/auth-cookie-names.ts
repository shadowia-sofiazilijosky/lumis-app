// Split out from auth-cookies.ts (which imports next/headers) so proxy.ts can
// read the cookie names without pulling in Server Component/Route Handler-only APIs.
export const ACCESS_TOKEN_COOKIE = "lumis_access_token";
export const REFRESH_TOKEN_COOKIE = "lumis_refresh_token";
// Tracks whether the current session opted into "remember me" -- same
// persistence rule as the token cookies themselves, so a silent refresh
// later on knows whether to keep re-issuing persistent or session cookies
// without the login form having to be involved again.
export const REMEMBER_ME_COOKIE = "lumis_remember_me";
