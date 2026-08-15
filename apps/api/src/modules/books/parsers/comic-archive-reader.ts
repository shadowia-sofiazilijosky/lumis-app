import AdmZip from 'adm-zip';
import { createExtractorFromData } from 'node-unrar-js';
import type { Extractor } from 'node-unrar-js';

/** Common read interface over a CBZ (zip) or CBR (rar) archive. */
export interface ComicArchiveReader {
  listEntryNames(): string[];
  readEntry(name: string): Buffer | undefined;
}

export class ZipComicArchiveReader implements ComicArchiveReader {
  private readonly zip: AdmZip;

  constructor(buffer: Buffer) {
    this.zip = new AdmZip(buffer);
  }

  listEntryNames(): string[] {
    return this.zip
      .getEntries()
      .filter((entry) => !entry.isDirectory)
      .map((entry) => entry.entryName);
  }

  readEntry(name: string): Buffer | undefined {
    const entry = this.zip.getEntry(name);
    return entry ? entry.getData() : undefined;
  }
}

export class RarComicArchiveReader implements ComicArchiveReader {
  private constructor(
    private readonly entryNames: string[],
    private readonly extractor: Extractor<Uint8Array>,
  ) {}

  static async create(buffer: Buffer): Promise<RarComicArchiveReader> {
    const extractor = await createExtractorFromData({
      data: bufferToArrayBuffer(buffer),
    });
    const entryNames = [...extractor.getFileList().fileHeaders]
      .filter((header) => !header.flags.directory)
      .map((header) => header.name);

    return new RarComicArchiveReader(entryNames, extractor);
  }

  listEntryNames(): string[] {
    return this.entryNames;
  }

  readEntry(name: string): Buffer | undefined {
    const result = this.extractor.extract({ files: [name] });
    for (const file of result.files) {
      if (file.fileHeader.name === name && file.extraction) {
        return Buffer.from(file.extraction);
      }
    }
    return undefined;
  }
}

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}
