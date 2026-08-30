// Small, fixed tag palette for notes — separate from the highlight color
// spectrum, this is just a quick visual category for a post-it. Shared
// between the reader's note editor and the Notas list page's post-its.
export const NOTE_TAG_COLORS: Record<string, string> = {
  YELLOW: "#f5d76e",
  PINK: "#e8a0bf",
  GREEN: "#a3d9a5",
  BLUE: "#9ec5e8",
};

export const DEFAULT_NOTE_TAG_COLOR = "YELLOW";

export function colorForTag(colorTag: string | null | undefined): string {
  return NOTE_TAG_COLORS[colorTag ?? ""] ?? NOTE_TAG_COLORS[DEFAULT_NOTE_TAG_COLOR];
}
