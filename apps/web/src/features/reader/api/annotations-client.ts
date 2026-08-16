import type {
  CreateHighlightDto,
  CreateNoteDto,
  Highlight,
  Note,
  UpdateNoteDto,
} from "@lumis/shared-types";

export async function fetchHighlights(bookId: string): Promise<Highlight[]> {
  const response = await fetch(`/api/books/${bookId}/highlights`);
  if (!response.ok) return [];
  return response.json();
}

export async function createHighlight(
  bookId: string,
  dto: CreateHighlightDto,
): Promise<Highlight | null> {
  const response = await fetch(`/api/books/${bookId}/highlights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!response.ok) return null;
  return response.json();
}

export async function deleteHighlight(
  bookId: string,
  highlightId: string,
): Promise<void> {
  await fetch(`/api/books/${bookId}/highlights/${highlightId}`, {
    method: "DELETE",
  });
}

export async function fetchNotes(bookId: string): Promise<Note[]> {
  const response = await fetch(`/api/books/${bookId}/notes`);
  if (!response.ok) return [];
  return response.json();
}

export async function createNote(
  bookId: string,
  dto: CreateNoteDto,
): Promise<Note | null> {
  const response = await fetch(`/api/books/${bookId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!response.ok) return null;
  return response.json();
}

export async function updateNote(
  bookId: string,
  noteId: string,
  dto: UpdateNoteDto,
): Promise<Note | null> {
  const response = await fetch(`/api/books/${bookId}/notes/${noteId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!response.ok) return null;
  return response.json();
}

export async function deleteNote(bookId: string, noteId: string): Promise<void> {
  await fetch(`/api/books/${bookId}/notes/${noteId}`, { method: "DELETE" });
}

export const HIGHLIGHT_COLOR_HEX: Record<string, string> = {
  YELLOW: "#f5d76e",
  PINK: "#e8a0bf",
  GREEN: "#a3d9a5",
  BLUE: "#9ec5e8",
};
