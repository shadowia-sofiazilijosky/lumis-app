export interface CreateHighlightDto {
  /** 6- or 8-digit hex (#RRGGBB[AA]) — free spectrum, not a fixed palette. */
  color: string;
  /** Highlighter-pen stroke thickness: "thin" | "normal" | "thick". */
  size?: string;
  pageIndex: number;
  startOffset: number;
  endOffset: number;
  selectedText: string;
  cfi?: string;
}

export interface UpdateHighlightDto {
  /** Setting this true unpins every other note/highlight on the same book. */
  pinned?: boolean;
}
