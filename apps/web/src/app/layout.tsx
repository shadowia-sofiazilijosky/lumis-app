import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { ThemeToggle } from "@/shared/components/theme-toggle";
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

// Warm serif for headings — the "reading nook" feel the rest of the palette goes for.
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lumis",
  description: "Tu biblioteca virtual personalizable.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = await getThemeCookie();

  return (
    <html
      lang="es"
      data-theme={theme ?? undefined}
      className={`${geistSans.variable} ${geistMono.variable} ${lora.variable}`}
    >
      <body>
        <ThemeToggle initialTheme={theme} />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
