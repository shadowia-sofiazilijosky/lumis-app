import { PublicUser } from "../entities/user.entity";

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
  /** Persists the session across browser restarts (up to 30 days) when
   * true. Defaults to false everywhere it's omitted -- a plain session
   * cookie that's gone the moment the browser fully closes. */
  rememberMe?: boolean;
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}
