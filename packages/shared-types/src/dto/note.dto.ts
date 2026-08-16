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
}
