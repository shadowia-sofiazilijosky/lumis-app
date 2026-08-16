const API_URL = process.env.API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API request failed with status ${status}`);
  }
}

/** Server-only fetch wrapper for the NestJS API. Never import this from a Client Component. */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  // FormData bodies must NOT get a manual Content-Type — fetch computes the
  // multipart boundary itself only when we leave the header unset.
  const isFormData = init?.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
    cache: "no-store",
  });

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const body = isJson ? await response.json() : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as T;
}
