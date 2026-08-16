export const BookFormat = {
  PDF: "PDF",
  EPUB: "EPUB",
  MOBI: "MOBI",
  CBR: "CBR",
  CBZ: "CBZ",
  TXT: "TXT",
} as const;

export type BookFormat = (typeof BookFormat)[keyof typeof BookFormat];
