import type { NotesOverview } from "@lumis/shared-types";

export async function fetchNotesOverview(): Promise<NotesOverview | null> {
  const response = await fetch("/api/notes");
  if (!response.ok) return null;
  return response.json();
}
