import { cookies } from "next/headers";
import { FONT_COOKIE, FONT_OPTIONS, type FontMode } from "./font-cookie-names";

export { FONT_COOKIE };
export type { FontMode };

/** Server-only — safe to call from Server Components (read-only, no cookie writes). */
export async function getFontCookie(): Promise<FontMode | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(FONT_COOKIE)?.value;
  return (FONT_OPTIONS as readonly string[]).includes(value ?? "")
    ? (value as FontMode)
    : null;
}
