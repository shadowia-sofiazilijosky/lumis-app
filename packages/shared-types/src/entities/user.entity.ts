import { FontPreference } from "../enums/font-preference.enum";
import { Role } from "../enums/role.enum";
import { ThemePreference } from "../enums/theme-preference.enum";

/** User as it comes over the wire (JSON) — dates are ISO strings, no passwordHash. */
export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: Role;
  themePreference: ThemePreference;
  fontPreference: FontPreference;
  createdAt: string;
  updatedAt: string;
}
