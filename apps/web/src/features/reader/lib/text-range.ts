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
/**
 * Sanity check for a just-formed Range against the pointer's actual drag
 * path. pdf.js's text layer is a flat list of absolutely-positioned spans
 * (taken out of normal document flow) — the browser still resolves
 * `Selection`/`Range` by DOM order between anchor and focus, which for a
 * drag that starts/ends near span boundaries can occasionally snap to a
 * far-away node and produce a Range that visually has nothing to do with
 * the drag (the "selected the whole page" / "selected an unrelated
 * paragraph" symptom). A real single-drag selection's bounding box should
 * roughly track the vertical distance the pointer actually moved; reject
 * anything wildly taller than that instead of committing a wrong highlight.
 */
export function isPlausibleDragSelection(
  range: Range,
  dragStartY: number,
  dragEndY: number,
): boolean {
  const rect = range.getBoundingClientRect();
  const dragHeight = Math.abs(dragEndY - dragStartY);
  const allowedHeight = Math.max(dragHeight * 1.8, 80);
  return rect.height <= allowedHeight;
}

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
