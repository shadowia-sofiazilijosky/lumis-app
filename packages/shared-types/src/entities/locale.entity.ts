/** The 20 languages the platform can be displayed in. `code` is ISO 639-1.
 * `nativeName` is how the language names itself (shown in its own script),
 * `name` is the Spanish label (used as a fallback/secondary label in the
 * selector, since the app's default language is Spanish). */
export interface SupportedLocale {
  code: string;
  name: string;
  nativeName: string;
  /** Right-to-left script. */
  rtl?: boolean;
}

export const SUPPORTED_LOCALES: SupportedLocale[] = [
  { code: "es", name: "Español", nativeName: "Español" },
  { code: "en", name: "Inglés", nativeName: "English" },
  { code: "pt", name: "Portugués", nativeName: "Português" },
  { code: "fr", name: "Francés", nativeName: "Français" },
  { code: "de", name: "Alemán", nativeName: "Deutsch" },
  { code: "it", name: "Italiano", nativeName: "Italiano" },
  { code: "zh", name: "Chino", nativeName: "中文" },
  { code: "ja", name: "Japonés", nativeName: "日本語" },
  { code: "ko", name: "Coreano", nativeName: "한국어" },
  { code: "ar", name: "Árabe", nativeName: "العربية", rtl: true },
  { code: "ru", name: "Ruso", nativeName: "Русский" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "bn", name: "Bengalí", nativeName: "বাংলা" },
  { code: "tr", name: "Turco", nativeName: "Türkçe" },
  { code: "vi", name: "Vietnamita", nativeName: "Tiếng Việt" },
  { code: "pl", name: "Polaco", nativeName: "Polski" },
  { code: "nl", name: "Neerlandés", nativeName: "Nederlands" },
  { code: "id", name: "Indonesio", nativeName: "Bahasa Indonesia" },
  { code: "sw", name: "Suajili", nativeName: "Kiswahili" },
  { code: "ur", name: "Urdu", nativeName: "اردو", rtl: true },
];

export const SUPPORTED_LOCALE_CODES = SUPPORTED_LOCALES.map((l) => l.code);
