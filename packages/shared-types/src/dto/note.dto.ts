export interface CreateNoteDto {
  pageIndex: number;
  offset: number;
  body: string;
  colorTag?: string;
  highlightId?: string;
  cfi?: string;
}

export interface UpdateNoteDto {
  body?: string;
  colorTag?: string;
  /** Setting this true unpins every other note/highlight on the same book. */
  pinned?: boolean;
}
