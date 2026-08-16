import type { BookSummary } from "@lumis/shared-types";

export async function fetchBooks(): Promise<BookSummary[]> {
  const response = await fetch("/api/books");
  if (!response.ok) return [];
  return response.json();
}
