import { FontPreference } from "../enums/font-preference.enum";
import { ThemePreference } from "../enums/theme-preference.enum";

export interface UpdateUserDto {
  themePreference?: ThemePreference;
  fontPreference?: FontPreference;
}
