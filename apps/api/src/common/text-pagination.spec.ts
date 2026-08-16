import { paginateText } from './text-pagination';

describe('paginateText', () => {
  it('returns a single page for short text', () => {
    const pages = paginateText('Hola mundo.', 1800);
    expect(pages).toEqual(['Hola mundo.']);
  });

  it('returns one empty page for empty text', () => {
    expect(paginateText('', 1800)).toEqual(['']);
  });

  it('breaks on paragraph boundaries instead of mid-word', () => {
    const paragraphA = 'A'.repeat(1000);
    const paragraphB = 'B'.repeat(1000);
    const pages = paginateText(`${paragraphA}\n\n${paragraphB}`, 1800);

    expect(pages).toHaveLength(2);
    expect(pages[0]).toBe(paragraphA);
    expect(pages[1]).toBe(paragraphB);
  });

  it('packs multiple short paragraphs onto the same page', () => {
    const pages = paginateText('Uno.\n\nDos.\n\nTres.', 1800);
    expect(pages).toHaveLength(1);
    expect(pages[0]).toBe('Uno.\n\nDos.\n\nTres.');
  });

  it('hard-chunks a single paragraph longer than one page', () => {
    const longParagraph = 'X'.repeat(4000);
    const pages = paginateText(longParagraph, 1800);

    expect(pages).toHaveLength(3);
    expect(pages[0]).toHaveLength(1800);
    expect(pages[1]).toHaveLength(1800);
    expect(pages[2]).toHaveLength(400);
    expect(pages.join('')).toBe(longParagraph);
  });
});
