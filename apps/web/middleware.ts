import { NextResponse, type NextRequest } from "next/server";

const LOCALE_COOKIE = "lumis_locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

// ISO 3166-1 alpha-2 country -> one of the 20 supported UI languages
// (SUPPORTED_LOCALES in @lumis/shared-types). Best-effort majority-language
// mapping, not exhaustive -- an unmapped country just falls through to the
// app's default (Spanish), same as any anonymous visitor today.
const COUNTRY_TO_LOCALE: Record<string, string> = {
  // Spanish
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es",
  EC: "es", GT: "es", CU: "es", BO: "es", DO: "es", HN: "es", PY: "es",
  SV: "es", NI: "es", CR: "es", PA: "es", UY: "es", GQ: "es",
  // English
  US: "en", GB: "en", CA: "en", AU: "en", NZ: "en", IE: "en", ZA: "en",
  JM: "en", TT: "en", PH: "en", NG: "en", GH: "en", KE: "en", UG: "en",
  // Portuguese
  PT: "pt", BR: "pt", AO: "pt", MZ: "pt", CV: "pt", GW: "pt", ST: "pt",
  // French
  FR: "fr", BE: "fr", CH: "fr", SN: "fr", CI: "fr", ML: "fr", NE: "fr",
  TG: "fr", BF: "fr", BJ: "fr", GA: "fr", CD: "fr", CG: "fr", MG: "fr",
  RW: "fr", BI: "fr", TD: "fr", CF: "fr", DJ: "fr", KM: "fr", HT: "fr",
  // German
  DE: "de", AT: "de", LI: "de",
  // Italian
  IT: "it", SM: "it", VA: "it",
  // Chinese
  CN: "zh", HK: "zh", TW: "zh", MO: "zh",
  // Japanese
  JP: "ja",
  // Korean
  KR: "ko", KP: "ko",
  // Arabic
  SA: "ar", EG: "ar", AE: "ar", IQ: "ar", JO: "ar", KW: "ar", QA: "ar",
  BH: "ar", OM: "ar", YE: "ar", SY: "ar", LB: "ar", LY: "ar", TN: "ar",
  DZ: "ar", MA: "ar", SD: "ar", PS: "ar",
  // Russian
  RU: "ru", BY: "ru",
  // Hindi
  IN: "hi",
  // Bengali
  BD: "bn",
  // Turkish
  TR: "tr",
  // Vietnamese
  VN: "vi",
  // Polish
  PL: "pl",
  // Dutch
  NL: "nl", SR: "nl",
  // Indonesian
  ID: "id",
  // Swahili
  TZ: "sw",
  // Urdu
  PK: "ur",
};

export function middleware(request: NextRequest) {
  // Never override an already-set preference (manual pick, or a previous
  // visit's detection) -- this only fires once, on a visitor's first hit.
  if (request.cookies.get(LOCALE_COOKIE)) {
    return NextResponse.next();
  }

  // Injected by Vercel's edge network on every request in production; absent
  // in local dev, where visitors just get the default (Spanish).
  const country = request.headers.get("x-vercel-ip-country");
  const locale = country ? COUNTRY_TO_LOCALE[country.toUpperCase()] : undefined;
  if (!locale) {
    return NextResponse.next();
  }

  // Also inject the cookie into the CURRENT request's headers (not just the
  // browser-bound response) -- otherwise the very first page render (the
  // one that matters most, since it's the landing page) would still read no
  // cookie server-side and fall back to Spanish, only picking up the
  // detected language from the *second* request onward.
  const forwardedHeaders = new Headers(request.headers);
  const existingCookieHeader = forwardedHeaders.get("cookie") ?? "";
  forwardedHeaders.set(
    "cookie",
    `${existingCookieHeader}${existingCookieHeader ? "; " : ""}${LOCALE_COOKIE}=${locale}`,
  );

  const response = NextResponse.next({ request: { headers: forwardedHeaders } });
  response.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: ONE_YEAR,
    path: "/",
    sameSite: "lax",
  });
  return response;
}

export const config = {
  // Skip static assets and API routes -- no point detecting locale for those.
  matcher: ["/((?!_next/|api/|.*\\.[\\w]+$).*)"],
};
