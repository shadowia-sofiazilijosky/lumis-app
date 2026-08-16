import type {
  ReaderTheme,
  ReadingProgress,
  UpdateReadingProgressDto,
} from "@lumis/shared-types";

export async function fetchReadingProgress(
  bookId: string,
): Promise<ReadingProgress | null> {
  const response = await fetch(`/api/books/${bookId}/progress`);
  if (!response.ok) return null;
  return response.json();
}

export async function saveReadingProgress(
  bookId: string,
  dto: UpdateReadingProgressDto,
): Promise<void> {
  await fetch(`/api/books/${bookId}/progress`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export function pageImageUrl(bookId: string, pageNumber: number): string {
  return `/api/books/${bookId}/pages/${pageNumber}`;
}

export interface TextPage {
  pageNumber: number;
  totalPages: number;
  text: string;
}

export async function fetchTextPage(
  bookId: string,
  pageNumber: number,
): Promise<TextPage> {
  const response = await fetch(`/api/books/${bookId}/pages/${pageNumber}`);
  if (!response.ok) {
    throw new Error("No pudimos cargar esta página.");
  }
  return response.json();
}

export const READER_THEME_LABELS: Record<ReaderTheme, string> = {
  LIGHT: "Claro",
  DARK: "Oscuro",
  SEPIA: "Sepia",
};
