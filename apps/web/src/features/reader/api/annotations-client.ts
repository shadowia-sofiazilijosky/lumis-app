import type {
  CreateHighlightDto,
  CreateNoteDto,
  CreateStrokeDto,
  Highlight,
  Note,
  Stroke,
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

export async function fetchStrokes(bookId: string): Promise<Stroke[]> {
  const response = await fetch(`/api/books/${bookId}/strokes`);
  if (!response.ok) return [];
  return response.json();
}

export async function createStroke(
  bookId: string,
  dto: CreateStrokeDto,
): Promise<Stroke | null> {
  const response = await fetch(`/api/books/${bookId}/strokes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!response.ok) return null;
  return response.json();
}

export async function deleteStroke(bookId: string, strokeId: string): Promise<void> {
  await fetch(`/api/books/${bookId}/strokes/${strokeId}`, { method: "DELETE" });
}
