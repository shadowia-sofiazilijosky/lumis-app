import { FontPreference } from "../enums/font-preference.enum";
import { ThemePreference } from "../enums/theme-preference.enum";

export interface UpdateUserDto {
  themePreference?: ThemePreference;
  fontPreference?: FontPreference;
  displayName?: string;
  bio?: string;
  location?: string;
  favoriteQuote?: string;
  readingGoal?: number;
  /** ISO 3166-1 alpha-2. */
  country?: string;
  /** IANA timezone name. */
  timezone?: string;
  /** ISO 639-1, one of SUPPORTED_LOCALE_CODES. */
  language?: string;
}
