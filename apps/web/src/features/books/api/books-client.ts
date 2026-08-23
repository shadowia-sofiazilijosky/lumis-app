import type { BookDetail, BookSummary } from "@lumis/shared-types";

export class BookRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function fetchBooks(): Promise<BookSummary[]> {
  const response = await fetch("/api/books");
  if (!response.ok) return [];
  return response.json();
}

export async function fetchBookDetail(bookId: string): Promise<BookDetail> {
  const response = await fetch(`/api/books/${bookId}`);
  const data = (await response.json().catch(() => null)) as
    | (BookDetail & { message?: string })
    | null;

  if (!response.ok) {
    throw new BookRequestError(
      response.status,
      data?.message ?? "No pudimos cargar el libro.",
    );
  }

  return data as BookDetail;
}

export async function reorderBooks(bookIds: string[]): Promise<void> {
  const response = await fetch("/api/books/reorder", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookIds }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new BookRequestError(
      response.status,
      data?.message ?? "No pudimos guardar el nuevo orden.",
    );
  }
}

export async function deleteBook(bookId: string): Promise<void> {
  const response = await fetch(`/api/books/${bookId}`, { method: "DELETE" });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new BookRequestError(
      response.status,
      data?.message ?? "No pudimos borrar el libro.",
    );
  }
}

export interface UploadBookFields {
  title?: string;
  author?: string;
}

/**
 * `fetch()` has no upload-progress event, so this specific call uses
 * XMLHttpRequest instead — the only way to surface real byte-level progress
 * for the upload bar.
 */
export function uploadBook(
  file: File,
  fields: UploadBookFields,
  onProgress?: (percent: number) => void,
): Promise<BookDetail> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    if (fields.title) formData.append("title", fields.title);
    if (fields.author) formData.append("author", fields.author);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/books");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as BookDetail);
        return;
      }

      let message = "No pudimos subir el libro.";
      try {
        const parsed = JSON.parse(xhr.responseText) as {
          message?: string | string[];
        };
        if (parsed.message) {
          message = Array.isArray(parsed.message)
            ? parsed.message.join(" ")
            : parsed.message;
        }
      } catch {
        // keep the default message
      }
      reject(new BookRequestError(xhr.status, message));
    };

    xhr.onerror = () =>
      reject(new BookRequestError(0, "Error de red al subir el libro."));

    xhr.send(formData);
  });
}
