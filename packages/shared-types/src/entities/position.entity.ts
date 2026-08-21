/** Freeform placement on a shelf's canvas, in logical canvas units. */
export interface Position {
  x: number;
  y: number;
  rotation?: number;
  /** Storage key for a user-uploaded spine photo — sent when saving. */
  customSpineImageKey?: string;
  /** Signed, short-lived URL resolved from customSpineImageKey — present on reads only. */
  customSpineImageUrl?: string;
}
