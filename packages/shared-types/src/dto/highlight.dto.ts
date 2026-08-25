export interface CreateHighlightDto {
  /** 6- or 8-digit hex (#RRGGBB[AA]) — free spectrum, not a fixed palette. */
  color: string;
  pageIndex: number;
  startOffset: number;
  endOffset: number;
  selectedText: string;
  cfi?: string;
}
