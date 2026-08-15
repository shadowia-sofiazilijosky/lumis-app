import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRefresh {
  userId: string;
  jti: string;
  refreshToken: string;
}
