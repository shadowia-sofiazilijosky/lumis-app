import { PublicUser } from "../entities/user.entity";

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}
