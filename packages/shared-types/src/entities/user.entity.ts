import { FontPreference } from "../enums/font-preference.enum";
import { Role } from "../enums/role.enum";
import { ThemePreference } from "../enums/theme-preference.enum";

/** User as it comes over the wire (JSON) — dates are ISO strings, no passwordHash. */
export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  /** Signed URL (never the raw storage path), null if no avatar uploaded. */
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  favoriteQuote: string | null;
  /** Annual reading goal (books) — null means no goal configured. */
  readingGoal: number | null;
  /** ISO 3166-1 alpha-2. */
  country: string | null;
  /** IANA timezone name. */
  timezone: string | null;
  /** ISO 639-1 UI language code, one of SUPPORTED_LOCALE_CODES. */
  language: string;
  role: Role;
  themePreference: ThemePreference;
  fontPreference: FontPreference;
  createdAt: string;
  updatedAt: string;
}
