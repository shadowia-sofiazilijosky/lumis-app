import { cookies } from "next/headers";
import { THEME_COOKIE, type ThemeMode } from "./theme-cookie-names";

export { THEME_COOKIE };
export type { ThemeMode };

/** Server-only — safe to call from Server Components (read-only, no cookie writes). */
export async function getThemeCookie(): Promise<ThemeMode | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(THEME_COOKIE)?.value;
  return value === "light" || value === "dark" ? value : null;
}
