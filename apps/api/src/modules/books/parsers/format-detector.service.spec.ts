import { UnprocessableEntityException } from '@nestjs/common';
import { BookFormat } from '@prisma/client';
import AdmZip from 'adm-zip';
import { FormatDetectorService } from './format-detector.service';

describe('FormatDetectorService', () => {
  const detector = new FormatDetectorService();

  it('detects PDF from its magic bytes', () => {
    const buffer = Buffer.concat([Buffer.from('%PDF-1.7\n'), Buffer.alloc(20)]);
    expect(detector.detect(buffer)).toBe(BookFormat.PDF);
  });

  it('detects MOBI from the BOOKMOBI header at offset 60', () => {
    const buffer = Buffer.alloc(80);
    buffer.write('BOOKMOBI', 60, 'ascii');
    expect(detector.detect(buffer)).toBe(BookFormat.MOBI);
  });

  it('detects EPUB from a zip with the epub mimetype entry', () => {
    const zip = new AdmZip();
    zip.addFile('mimetype', Buffer.from('application/epub+zip'));
    zip.addFile('OEBPS/content.opf', Buffer.from('<package/>'));
    expect(detector.detect(zip.toBuffer())).toBe(BookFormat.EPUB);
  });

  it('detects CBZ from a zip that is mostly images', () => {
    const zip = new AdmZip();
    zip.addFile('page1.jpg', Buffer.from([0xff, 0xd8, 0xff]));
    zip.addFile('page2.jpg', Buffer.from([0xff, 0xd8, 0xff]));
    expect(detector.detect(zip.toBuffer())).toBe(BookFormat.CBZ);
  });

  it('detects CBR from the RAR signature', () => {
    const buffer = Buffer.from([
      0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00, 0x00,
    ]);
    expect(detector.detect(buffer)).toBe(BookFormat.CBR);
  });

  it('falls back to TXT for plain text content', () => {
    const buffer = Buffer.from('Capítulo uno: había una vez...', 'utf-8');
    expect(detector.detect(buffer)).toBe(BookFormat.TXT);
  });

  it('rejects unrecognized binary content', () => {
    const buffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]);
    expect(() => detector.detect(buffer)).toThrow(UnprocessableEntityException);
  });

  it('rejects a zip that is neither an EPUB nor mostly images', () => {
    const zip = new AdmZip();
    zip.addFile('data.json', Buffer.from('{}'));
    expect(() => detector.detect(zip.toBuffer())).toThrow(
      UnprocessableEntityException,
    );
  });
});
