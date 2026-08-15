import { Role } from "../enums/role.enum";

/** User as it comes over the wire (JSON) — dates are ISO strings, no passwordHash. */
export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: Role;
  themePreference: "LIGHT" | "DARK" | "SYSTEM";
  createdAt: string;
  updatedAt: string;
}
