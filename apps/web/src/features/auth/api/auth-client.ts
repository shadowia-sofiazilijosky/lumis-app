import type { LoginInput, PublicUser, RegisterInput } from "@lumis/shared-types";

export class AuthRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | null;

  if (!response.ok) {
    throw new AuthRequestError(
      response.status,
      data?.message ?? "Algo salió mal. Probá de nuevo.",
    );
  }

  return data as T;
}

export function register(input: RegisterInput): Promise<{ user: PublicUser }> {
  return postJson("/api/auth/register", input);
}

export function login(input: LoginInput): Promise<{ user: PublicUser }> {
  return postJson("/api/auth/login", input);
}

export function logout(): Promise<{ ok: true }> {
  return postJson("/api/auth/logout");
}

export async function fetchCurrentUser(): Promise<PublicUser | null> {
  const response = await fetch("/api/auth/me");
  if (!response.ok) return null;
  const data = (await response.json()) as { user: PublicUser | null };
  return data.user;
}
