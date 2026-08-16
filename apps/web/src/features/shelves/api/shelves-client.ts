import type {
  AddBookToShelfInput,
  CreateShelfInput,
  Shelf,
  ShelfListItem,
  ShelfWithBooks,
  UpdateShelfInput,
  UpdateShelfLayoutInput,
} from "@lumis/shared-types";

export class ShelfRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const data = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | null;

  if (!response.ok) {
    throw new ShelfRequestError(
      response.status,
      data?.message ?? "Algo salió mal. Probá de nuevo.",
    );
  }

  return data as T;
}

export function fetchShelves(): Promise<ShelfListItem[]> {
  return request("/api/shelves");
}

export function fetchShelf(shelfId: string): Promise<ShelfWithBooks> {
  return request(`/api/shelves/${shelfId}`);
}

export function createShelf(input: CreateShelfInput): Promise<Shelf> {
  return request("/api/shelves", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateShelf(
  shelfId: string,
  input: UpdateShelfInput,
): Promise<Shelf> {
  return request(`/api/shelves/${shelfId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteShelf(shelfId: string): Promise<void> {
  return request(`/api/shelves/${shelfId}`, { method: "DELETE" });
}

export function addBookToShelf(
  shelfId: string,
  input: AddBookToShelfInput,
): Promise<void> {
  return request(`/api/shelves/${shelfId}/books`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function removeBookFromShelf(
  shelfId: string,
  bookId: string,
): Promise<void> {
  return request(`/api/shelves/${shelfId}/books/${bookId}`, {
    method: "DELETE",
  });
}

export function saveShelfLayout(
  shelfId: string,
  input: UpdateShelfLayoutInput,
): Promise<void> {
  return request(`/api/shelves/${shelfId}/layout`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
