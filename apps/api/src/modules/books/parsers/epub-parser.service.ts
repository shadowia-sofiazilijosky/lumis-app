import { Injectable } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';
import { dirname, extname, posix } from 'node:path';
import { BookParser, ParsedBookMetadata } from './book-parser.interface';

const IMAGE_CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

interface ManifestItem {
  '@_id'?: string;
  '@_href'?: string;
  '@_properties'?: string;
}

@Injectable()
export class EpubParserService implements BookParser {
  private readonly xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  // eslint-disable-next-line @typescript-eslint/require-await
  async parse(
    buffer: Buffer,
    originalFilename: string,
  ): Promise<ParsedBookMetadata> {
    const zip = new AdmZip(buffer);

    const opfPath = this.findOpfPath(zip);
    const opfEntry = opfPath ? zip.getEntry(opfPath) : null;
    if (!opfPath || !opfEntry) {
      return { title: originalFilename };
    }

    const opfXml = this.xmlParser.parse(zip.readAsText(opfEntry)) as {
      package?: {
        metadata?: Record<string, unknown>;
        manifest?: { item?: ManifestItem | ManifestItem[] };
      };
    };
    const pkg = opfXml.package ?? {};
    const metadata = pkg.metadata ?? {};
    const manifest = this.toArray<ManifestItem>(pkg.manifest?.item);

    const title = this.firstText(metadata['dc:title']) ?? originalFilename;
    const author = this.firstText(metadata['dc:creator']);
    const language = this.firstText(metadata['dc:language']);
    const identifier = this.firstText(metadata['dc:identifier']);

    const coverHref = this.findCoverHref(manifest, metadata);
    const opfDir = dirname(opfPath);

    let coverBuffer: Buffer | undefined;
    let coverContentType: string | undefined;

    if (coverHref) {
      const coverZipPath = posix.normalize(posix.join(opfDir, coverHref));
      const coverEntry = zip.getEntry(coverZipPath);
      if (coverEntry) {
        coverBuffer = coverEntry.getData();
        coverContentType =
          IMAGE_CONTENT_TYPES[extname(coverZipPath).toLowerCase()];
      }
    }

    return {
      title,
      author,
      coverBuffer,
      coverContentType,
      metadata: { language, identifier },
    };
  }

  private findOpfPath(zip: AdmZip): string | null {
    const containerEntry = zip.getEntry('META-INF/container.xml');
    if (!containerEntry) return null;

    const parsed = this.xmlParser.parse(zip.readAsText(containerEntry)) as {
      container?: {
        rootfiles?: {
          rootfile?: { '@_full-path'?: string } | { '@_full-path'?: string }[];
        };
      };
    };
    const rootfile = this.toArray(parsed.container?.rootfiles?.rootfile)[0];
    return rootfile?.['@_full-path'] ?? null;
  }

  private findCoverHref(
    manifest: ManifestItem[],
    metadata: Record<string, unknown>,
  ): string | undefined {
    // EPUB3: manifest item marked with properties="cover-image"
    const epub3Cover = manifest.find((item) =>
      (item['@_properties'] ?? '').split(/\s+/).includes('cover-image'),
    );
    if (epub3Cover?.['@_href']) return epub3Cover['@_href'];

    // EPUB2: <meta name="cover" content="manifest-item-id"/>
    const coverMeta = this.toArray(
      metadata.meta as
        | { '@_name'?: string; '@_content'?: string }
        | { '@_name'?: string; '@_content'?: string }[]
        | undefined,
    ).find((meta) => meta['@_name'] === 'cover');
    const coverId = coverMeta?.['@_content'];
    if (coverId) {
      const item = manifest.find((entry) => entry['@_id'] === coverId);
      if (item?.['@_href']) return item['@_href'];
    }

    return undefined;
  }

  private toArray<T>(value: T | T[] | undefined | null): T[] {
    if (value === undefined || value === null) return [];
    return Array.isArray(value) ? value : [value];
  }

  private firstText(value: unknown): string | undefined {
    if (value === undefined || value === null) return undefined;
    const item: unknown = Array.isArray(value) ? value[0] : value;

    if (typeof item === 'string') return item.trim() || undefined;
    if (typeof item === 'object' && item !== null && '#text' in item) {
      return String(item['#text']).trim() || undefined;
    }
    return undefined;
  }
}
