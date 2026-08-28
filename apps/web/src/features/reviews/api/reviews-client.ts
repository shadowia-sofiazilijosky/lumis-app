import type { Review, UpsertReviewDto } from "@lumis/shared-types";

export async function fetchReview(bookId: string): Promise<Review | null> {
  const response = await fetch(`/api/books/${bookId}/review`);
  if (!response.ok) return null;
  return response.json();
}

export async function saveReview(
  bookId: string,
  dto: UpsertReviewDto,
): Promise<Review | null> {
  const response = await fetch(`/api/books/${bookId}/review`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!response.ok) return null;
  return response.json();
}
