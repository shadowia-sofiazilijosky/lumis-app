import { HighlightColor } from "../enums/highlight-color.enum";

export interface CreateHighlightDto {
  color: HighlightColor;
  pageIndex: number;
  startOffset: number;
  endOffset: number;
  selectedText: string;
  cfi?: string;
}
