export interface ParsedBookMetadata {
  title: string;
  author?: string;
  pageCount?: number;
  coverBuffer?: Buffer;
  coverContentType?: string;
  metadata?: Record<string, unknown>;
}

export interface BookParser {
  parse(buffer: Buffer, originalFilename: string): Promise<ParsedBookMetadata>;
}
