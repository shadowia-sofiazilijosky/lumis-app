/**
 * DOM Range <-> plain-character-offset conversion, shared by the PDF text
 * layer and the TXT reader — both anchor highlights/notes as offsets into a
 * page's plain text, not into the DOM structure (which pdf.js/our own
 * rendering can rebuild at any time).
 */

export function getOffsetsFromRange(
  container: Element,
  range: Range,
): { start: number; end: number; text: string } {
  const preStart = document.createRange();
  preStart.selectNodeContents(container);
  preStart.setEnd(range.startContainer, range.startOffset);
  const start = preStart.toString().length;
  const text = range.toString();
  return { start, end: start + text.length, text };
}

export function rangeFromOffsets(
  container: Element,
  start: number,
  end: number,
): Range | null {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let node: Text | null;
  let cumulative = 0;
  let startNode: Text | null = null;
  let startOffset = 0;
  let endNode: Text | null = null;
  let endOffset = 0;

  while ((node = walker.nextNode() as Text | null)) {
    const nextCumulative = cumulative + node.data.length;

    if (startNode === null && start <= nextCumulative) {
      startNode = node;
      startOffset = Math.max(0, start - cumulative);
    }
    if (endNode === null && end <= nextCumulative) {
      endNode = node;
      endOffset = Math.max(0, end - cumulative);
      break;
    }
    cumulative = nextCumulative;
  }

  if (!startNode || !endNode) return null;

  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  return range;
}

/**
 * Client rects for a stored [start, end) offset range, relative to
 * `container`'s scrollable content origin (not the currently-visible
 * viewport) — so an absolutely-positioned overlay mark placed at these
 * coordinates, as a child of `container`, stays aligned with the text as
 * the container scrolls, with no recompute needed on scroll.
 */
export function rectsForOffsets(
  container: Element,
  start: number,
  end: number,
): DOMRect[] {
  const range = rangeFromOffsets(container, start, end);
  if (!range) return [];

  const containerRect = container.getBoundingClientRect();
  return Array.from(range.getClientRects())
    .filter((rect) => rect.width > 0 && rect.height > 0)
    .map(
      (rect) =>
        new DOMRect(
          rect.left - containerRect.left + container.scrollLeft,
          rect.top - containerRect.top + container.scrollTop,
          rect.width,
          rect.height,
        ),
    );
}
