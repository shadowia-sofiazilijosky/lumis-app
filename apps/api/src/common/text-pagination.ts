export const CHARS_PER_PAGE = 1800;

/**
 * Splits plain text into fixed-size pages, breaking on paragraph boundaries
 * where possible instead of mid-word. A single paragraph longer than a page
 * gets hard-chunked. Shared by TxtParserService (page count at ingestion)
 * and ReaderService (page-by-number lookup) so both agree on the same pages.
 */
export function paginateText(
  text: string,
  targetCharsPerPage: number = CHARS_PER_PAGE,
): string[] {
  const paragraphs = text.split(/\n{2,}/);
  const pages: string[] = [];
  let current = '';

  for (const paragraph of paragraphs) {
    if (
      current.length > 0 &&
      current.length + paragraph.length + 2 > targetCharsPerPage
    ) {
      pages.push(current.trim());
      current = '';
    }

    if (paragraph.length > targetCharsPerPage) {
      if (current.trim()) {
        pages.push(current.trim());
        current = '';
      }
      for (let i = 0; i < paragraph.length; i += targetCharsPerPage) {
        pages.push(paragraph.slice(i, i + targetCharsPerPage));
      }
      continue;
    }

    current += (current ? '\n\n' : '') + paragraph;
  }

  if (current.trim()) pages.push(current.trim());

  return pages.length > 0 ? pages : [''];
}
