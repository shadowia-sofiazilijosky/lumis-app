import { SUPPORTED_LOCALES } from "@lumis/shared-types";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Caveat, Geist, Geist_Mono, Inter, Lora, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { getFontCookie } from "@/shared/lib/font-cookie";
import { getThemeCookie } from "@/shared/lib/theme-cookie";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The 4 selectable heading fonts (user preference, see FontSelector) — each
// gets its own CSS variable; globals.css picks one via [data-font="..."].
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lumis — Your library, your way",
  description: "Tu biblioteca virtual personalizable.",
  icons: {
    icon: "/favicon-lumis.png",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [theme, font, locale, messages] = await Promise.all([
    getThemeCookie(),
    getFontCookie(),
    getLocale(),
    getMessages(),
  ]);
  const isRtl = SUPPORTED_LOCALES.find((l) => l.code === locale)?.rtl ?? false;

  return (
    <html
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      data-theme={theme ?? undefined}
      data-font={font ?? undefined}
      className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} ${playfairDisplay.variable} ${inter.variable} ${caveat.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>{children}</AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
