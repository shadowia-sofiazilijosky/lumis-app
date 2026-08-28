import { SUPPORTED_LOCALE_CODES } from "@lumis/shared-types";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { getServerUser } from "@/shared/lib/auth-server";

const DEFAULT_LOCALE = "es";

// No URL-based locale routing (no /en/, /es/ prefixes) -- this is a logged-in
// app where the language is a user preference set in the profile, exactly
// like theme/font. Source of truth is `user.language`; for pages rendered
// before we know who's logged in (landing, login, register) we fall back to
// a plain cookie, then to Spanish.
async function resolveLocale(): Promise<string> {
  const user = await getServerUser();
  if (user?.language && SUPPORTED_LOCALE_CODES.includes(user.language)) {
    return user.language;
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("lumis_locale")?.value;
  if (cookieLocale && SUPPORTED_LOCALE_CODES.includes(cookieLocale)) {
    return cookieLocale;
  }

  return DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
