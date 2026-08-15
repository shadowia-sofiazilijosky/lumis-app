import { Injectable } from '@nestjs/common';
import { BookFormat } from '@prisma/client';
import { XMLParser } from 'fast-xml-parser';
import { basename, extname } from 'node:path';
import {
  ComicArchiveReader,
  RarComicArchiveReader,
  ZipComicArchiveReader,
} from './comic-archive-reader';
import { ParsedBookMetadata } from './book-parser.interface';

const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
]);

const IMAGE_CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
};

interface ComicInfo {
  title?: string;
  writer?: string;
  series?: string;
  number?: string;
}

/** CBZ and CBR are both just page-image archives; ComicInfo.xml (if present) is an unofficial but common convention. */
@Injectable()
export class ComicParserService {
  private readonly xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  async parse(
    buffer: Buffer,
    originalFilename: string,
    format: typeof BookFormat.CBR | typeof BookFormat.CBZ,
  ): Promise<ParsedBookMetadata> {
    const reader: ComicArchiveReader =
      format === BookFormat.CBZ
        ? new ZipComicArchiveReader(buffer)
        : await RarComicArchiveReader.create(buffer);

    const entryNames = reader.listEntryNames();
    const pageNames = entryNames
      .filter((name) => IMAGE_EXTENSIONS.has(extname(name).toLowerCase()))
      .sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
      );

    const comicInfoName = entryNames.find(
      (name) => basename(name).toLowerCase() === 'comicinfo.xml',
    );
    const comicInfo = comicInfoName
      ? this.parseComicInfoXml(reader.readEntry(comicInfoName))
      : null;

    const coverName = pageNames[0];
    const coverBuffer = coverName ? reader.readEntry(coverName) : undefined;

    return {
      title:
        comicInfo?.title?.trim() ||
        basename(originalFilename, extname(originalFilename)),
      author: comicInfo?.writer?.trim(),
      pageCount: pageNames.length,
      coverBuffer,
      coverContentType: coverName
        ? IMAGE_CONTENT_TYPES[extname(coverName).toLowerCase()]
        : undefined,
      metadata: comicInfo
        ? { series: comicInfo.series, number: comicInfo.number }
        : undefined,
    };
  }

  private parseComicInfoXml(buffer: Buffer | undefined): ComicInfo | null {
    if (!buffer) return null;

    try {
      const parsed = this.xmlParser.parse(buffer.toString('utf-8')) as {
        ComicInfo?: Record<string, unknown>;
      };
      const info = parsed.ComicInfo ?? {};

      return {
        title: typeof info.Title === 'string' ? info.Title : undefined,
        writer: typeof info.Writer === 'string' ? info.Writer : undefined,
        series: typeof info.Series === 'string' ? info.Series : undefined,
        number:
          typeof info.Number === 'string' || typeof info.Number === 'number'
            ? String(info.Number)
            : undefined,
      };
    } catch {
      return null;
    }
  }
}
